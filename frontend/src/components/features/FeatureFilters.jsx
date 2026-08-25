import React from 'react';
import { FiSearch } from 'react-icons/fi';

export default function FeatureFilters({
  keyword,
  setKeyword,
  isAdmin,
  selectedEnv,
  setSelectedEnv,
  statusFilter,
  setStatusFilter,
  setPage
}) {
  return (
    <div className="features-filters-bar">
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by flag name or key..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(0);
          }}
          className="filter-search-input"
        />
      </div>

      {isAdmin && (
        <div className="filter-select-wrapper">
          <select
            value={selectedEnv}
            onChange={(e) => {
              setSelectedEnv(e.target.value);
              setPage(0);
            }}
            className="filter-status-select"
          >
            <option value="DEVELOPMENT">DEVELOPMENT</option>
            <option value="STAGING">STAGING</option>
            <option value="PRODUCTION">PRODUCTION</option>
          </select>
        </div>
      )}

      <div className="filter-select-wrapper">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
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
  );
}
