import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBar.css';

function SearchBar({ url, setUrl, loading, handleInspect, searchOpen, setSearchOpen }) {
  return (
    <div className={`searchbar-container${searchOpen ? ' open' : ''}`} onClick={() => !searchOpen && setSearchOpen(true)}>
      {!searchOpen && (
        <FaSearch className="searchbar-icon" />
      )}
      {searchOpen && (
        <>
          <input
            className="searchbar-input"
            type="text"
            placeholder="Paste RRB Exam Result URL here..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            className="searchbar-button"
            onClick={handleInspect}
            disabled={loading || !url.trim()}
          >
            {loading ? '🔄 Analyzing...' : '🚀 Analyze & Calculate'}
          </button>
        </>
      )}
    </div>
  );
}

export default SearchBar; 