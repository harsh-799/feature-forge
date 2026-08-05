import { useState, useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { FiPlus, FiSearch, FiCalendar, FiInbox } from 'react-icons/fi'
import { listFeatures, searchFeatures } from '../../api/featureApi'
import { getErrorMessage } from '../../api/authApi'
import { toast } from 'react-toastify'
import './FeatureFlags.css'

export default function FeatureFlags() {
  const { currentWorkspaceId, role } = useOutletContext();
  const [features, setFeatures] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const canCreate = role === 'ADMIN' || role === 'DEVELOPER';

  const fetchFeatures = async (targetPage = page, targetFilter = statusFilter, targetKeyword = keyword) => {
    if (!currentWorkspaceId) return;

    setIsLoading(true);
    const startTime = Date.now();
    try {
      let response;
      const kw = targetKeyword.trim();
      const pg = targetPage;
      const sf = targetFilter || null;

      if (kw) {
        response = await searchFeatures(currentWorkspaceId, {
          keyword: kw,
          page: pg,
          size: 6,
          status: sf
        });
      } else {
        response = await listFeatures(currentWorkspaceId, {
          page: pg,
          size: 6,
          status: sf
        });
      }

      if (response && response.success) {
        // Enforce a minimum loader duration of 350ms to prevent skeleton screen flashing/flicker
        const elapsed = Date.now() - startTime;
        const minDelay = 350;
        if (elapsed < minDelay) {
          await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
        }

        setFeatures(response.features || []);
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

  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  // Debounce keyword search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Reset page to 0 when workspace changes
  useEffect(() => {
    setPage(0);
  }, [currentWorkspaceId]);

  // Main features fetch effect
  useEffect(() => {
    if (!currentWorkspaceId) return;
    fetchFeatures(page, statusFilter, debouncedKeyword);
  }, [currentWorkspaceId, page, statusFilter, debouncedKeyword]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const getStatusLabelClass = (status) => {
    switch (status) {
      case 'IN_DEVELOPMENT': return 'status-dev';
      case 'READY_FOR_QA': return 'status-qa';
      case 'QA_VERIFIED': return 'status-qa-verified';
      case 'QA_REJECTED': return 'status-qa-rejected';
      case 'IN_PRODUCTION': return 'status-prod';
      default: return 'status-default';
    }
  };

  const formatStatusText = (status) => {
    return status ? status.replace(/_/g, ' ') : '';
  };

  return (
    <div className="features-page-container">
      {/* Title & Create Flag CTA */}
      <div className="page-header-row">
        <header className="page-header-group">
          <h1 className="page-header-title">Feature Flags</h1>
          <p className="page-header-description">Configure release lifecycles and target audiences independently.</p>
        </header>
        {canCreate && (
          <Link to="/app/features/new" className="create-flag-btn">
            <FiPlus style={{ marginRight: '6px' }} /> Create Feature Flag
          </Link>
        )}
      </div>

      {/* Filters Area */}
      <div className="features-filters-bar">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by flag name or key..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            className="filter-search-input"
          />
        </div>

        <div className="filter-select-wrapper">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="filter-status-select"
          >
            <option value="">All Statuses</option>
            <option value="IN_DEVELOPMENT">In Development</option>
            <option value="READY_FOR_QA">Ready for QA</option>
            <option value="QA_VERIFIED">QA Verified</option>
            <option value="QA_REJECTED">QA Rejected</option>
            <option value="IN_PRODUCTION">In Production</option>
          </select>
        </div>
      </div>

      {/* Flag List View */}
      {isLoading ? (
        <div className="features-grid-list loading">
          {[1, 2, 3].map((n) => (
            <div key={n} className="feature-card-skeleton pulse">
              <div className="skeleton-line title"></div>
              <div className="skeleton-line desc"></div>
              <div className="skeleton-line meta"></div>
            </div>
          ))}
        </div>
      ) : features.length === 0 ? (
        <div className="features-empty-state">
          <div className="empty-state-icon-circle">
            <FiInbox size={24} />
          </div>
          <h3>No feature flags found</h3>
          <p>
            {keyword || statusFilter
              ? 'No feature flags match your search query or filters. Clear your filters to view all flags.'
              : 'Create your first feature flag to start managing code deployments independently from feature releases.'}
          </p>
          {!keyword && !statusFilter && canCreate && (
            <Link to="/app/features/new" className="empty-state-create-btn">
              <FiPlus style={{ marginRight: '6px' }} /> Create Your First Flag
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="features-grid-list">
            {features.map((feature) => (
              <div key={feature.featureId} className="feature-item-card">
                <div className="feature-card-main-info">
                  <div className="feature-card-headline">
                    <h3>{feature.name}</h3>
                    <span className={`status-pill-badge ${getStatusLabelClass(feature.status)}`}>
                      {formatStatusText(feature.status)}
                    </span>
                  </div>
                  <code className="feature-card-key-code">{feature.key}</code>
                  {feature.description && (
                    <p className="feature-card-description">{feature.description}</p>
                  )}
                </div>

                <div className="feature-card-footer">
                  <div className="feature-card-date-meta">
                    <FiCalendar size={13} style={{ marginRight: '6px' }} />
                    <span>Created {new Date(feature.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link
                    to={`/app/features/${feature.featureId}`}
                    className="feature-card-manage-link"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
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
        </>
      )}
    </div>
  );
}
