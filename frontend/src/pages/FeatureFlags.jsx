import { useState, useEffect, useRef } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import {
  listFeatures,
  activateFeatureProduction,
  deactivateFeatureProduction,
  activateFeatureDevelopment,
  deactivateFeatureDevelopment,
  activateFeatureStaging,
  deactivateFeatureStaging
} from '../api/featureApi'
import { getErrorMessage } from '../api/authApi'
import { toast } from 'react-toastify'
import FeatureFilters from '../components/features/FeatureFilters'
import FeatureList from '../components/features/FeatureList'
import './FeatureFlags.css'

export default function FeatureFlags() {
  const { currentWorkspaceId, role } = useOutletContext();
  const activeRole = role || localStorage.getItem('currentWorkspaceRole') || 'DEVELOPER';

  const getDefaultEnvForRole = (userRole) => {
    if (userRole === 'DEVELOPER') return 'DEVELOPMENT';
    if (userRole === 'QA') return 'STAGING';
    if (userRole === 'ADMIN') return 'PRODUCTION';
    return 'DEVELOPMENT';
  };

  const [selectedEnv, setSelectedEnv] = useState(() => getDefaultEnvForRole(activeRole));
  const [features, setFeatures] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Per-feature pending states to prevent duplicate conflicting requests
  const [pendingFeatureIds, setPendingFeatureIds] = useState(() => new Set());
  // Request sequence counter per feature to ensure older requests cannot overwrite newer state
  const toggleSequenceRef = useRef({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const canCreate = activeRole === 'ADMIN' || activeRole === 'DEVELOPER';
  const isAdmin = activeRole === 'ADMIN';

  const fetchFeatures = async (targetPage = page, targetFilter = statusFilter, targetKeyword = keyword) => {
    if (!currentWorkspaceId) return;

    setIsLoading(true);
    const startTime = Date.now();
    try {
      const kw = targetKeyword.trim();
      const pg = targetPage;
      const sf = targetFilter || null;

      const response = await listFeatures(currentWorkspaceId, {
        page: pg,
        size: 6,
        status: sf,
        keyword: kw,
        environment: selectedEnv
      });

      if (response && response.success) {
        // Enforce a minimum loader duration of 350ms to prevent skeleton screen flashing/flicker
        const elapsed = Date.now() - startTime;
        const minDelay = 350;
        if (elapsed < minDelay) {
          await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
        }

        const rawFeatures = response.features || [];
        setFeatures(rawFeatures);
        const totalElements = response.totalElements || 0;
        setTotalPages(Math.ceil(totalElements / 6) || 1);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (feature) => {
    const featureId = feature.featureId;

    // Prevent conflicting requests for the same feature while one is already pending
    if (pendingFeatureIds.has(featureId)) {
      return;
    }

    const previousEnabled = Boolean(feature.isEnabled);
    const targetEnabled = !previousEnabled;

    // Increment request sequence for this feature to prevent race conditions
    const currentSeq = (toggleSequenceRef.current[featureId] || 0) + 1;
    toggleSequenceRef.current[featureId] = currentSeq;

    // 1. Mark as pending for this specific feature
    setPendingFeatureIds((prev) => {
      const next = new Set(prev);
      next.add(featureId);
      return next;
    });

    // 2. Optimistic UI update: immediately flip isEnabled in local state
    setFeatures((prevFeatures) =>
      prevFeatures.map((f) =>
        f.featureId === featureId ? { ...f, isEnabled: targetEnabled } : f
      )
    );

    try {
      let response;
      if (selectedEnv === 'PRODUCTION') {
        if (targetEnabled) {
          response = await activateFeatureProduction(featureId, {
            workspaceId: currentWorkspaceId,
            rolloutPercentage: 100
          });
        } else {
          response = await deactivateFeatureProduction(featureId, {
            workspaceId: currentWorkspaceId
          });
        }
      } else if (selectedEnv === 'STAGING') {
        if (targetEnabled) {
          response = await activateFeatureStaging(featureId, {
            workspaceId: currentWorkspaceId
          });
        } else {
          response = await deactivateFeatureStaging(featureId, {
            workspaceId: currentWorkspaceId
          });
        }
      } else {
        // DEVELOPMENT
        if (targetEnabled) {
          response = await activateFeatureDevelopment(featureId, {
            workspaceId: currentWorkspaceId
          });
        } else {
          response = await deactivateFeatureDevelopment(featureId, {
            workspaceId: currentWorkspaceId
          });
        }
      }

      if (!isMountedRef.current) return;
      if (toggleSequenceRef.current[featureId] !== currentSeq) return;

      if (response && response.success) {
        toast.success(response.message || `Feature flag ${targetEnabled ? 'enabled' : 'disabled'} successfully!`);

        // Synchronize with any server-returned feature attributes if present
        setFeatures((prevFeatures) =>
          prevFeatures.map((f) => {
            if (f.featureId === featureId) {
              const updated = { ...f, isEnabled: targetEnabled };
              if (response.rolloutPercentage !== undefined && response.rolloutPercentage !== null) {
                updated.rolloutPercentage = response.rolloutPercentage;
              }
              if (response.feature) {
                Object.assign(updated, response.feature);
                updated.isEnabled = targetEnabled;
              }
              return updated;
            }
            return f;
          })
        );
      } else {
        // Server returned unsuccessful status: rollback to previous confirmed state
        setFeatures((prevFeatures) =>
          prevFeatures.map((f) =>
            f.featureId === featureId ? { ...f, isEnabled: previousEnabled } : f
          )
        );
        toast.error(response?.message || 'Failed to update feature flag state.');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (toggleSequenceRef.current[featureId] === currentSeq) {
        // Rollback to previous confirmed state on network or server error
        setFeatures((prevFeatures) =>
          prevFeatures.map((f) =>
            f.featureId === featureId ? { ...f, isEnabled: previousEnabled } : f
          )
        );
        const msg = getErrorMessage(err);
        toast.error(msg);
      }
    } finally {
      if (isMountedRef.current && toggleSequenceRef.current[featureId] === currentSeq) {
        setPendingFeatureIds((prev) => {
          const next = new Set(prev);
          next.delete(featureId);
          return next;
        });
      }
    }
  };

  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  // Debounce keyword search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Reset page and selected environment when workspace or role changes
  useEffect(() => {
    setPage(0);
    setSelectedEnv(getDefaultEnvForRole(activeRole));
  }, [currentWorkspaceId, activeRole]);

  // Main features fetch effect
  useEffect(() => {
    if (!currentWorkspaceId) return;
    fetchFeatures(page, statusFilter, debouncedKeyword);
  }, [currentWorkspaceId, page, statusFilter, debouncedKeyword, selectedEnv]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="features-page-container">
      {/* Title & Create Flag CTA */}
      <div className="page-header-row">
        <header className="page-header-group">
          <span className="header-badge-tag">FEATURE FLAGS</span>
          <h1 className="page-header-title">Feature Flags</h1>
          <p className="page-header-description">Configure release lifecycles and target audiences independently.</p>
        </header>
        {canCreate && (
          <Link to="/app/features/new" className="create-flag-btn">
            <FiPlus className="btn-icon-space" /> Create Feature Flag
          </Link>
        )}
      </div>

      {/* Filters Area */}
      <FeatureFilters
        keyword={keyword}
        setKeyword={setKeyword}
        isAdmin={isAdmin}
        selectedEnv={selectedEnv}
        setSelectedEnv={setSelectedEnv}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setPage={setPage}
      />

      {/* Flag List View */}
      <FeatureList
        features={features}
        isLoading={isLoading}
        canCreate={canCreate}
        handleToggle={handleToggle}
        debouncedKeyword={debouncedKeyword}
        keyword={keyword}
        statusFilter={statusFilter}
        pendingFeatureIds={pendingFeatureIds}
      />

      {/* Pagination Controls */}
      {!isLoading && features.length > 0 && totalPages > 1 && (
        <div className="pagination-bar">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="pagination-arrow-btn"
          >
            Previous
          </button>
          <span className="pagination-info-text">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages - 1}
            className="pagination-arrow-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
