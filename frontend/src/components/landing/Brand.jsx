import React from 'react'
import logoMarkImg from '../../assets/logo-mark.png'
import logoFullImg from '../../assets/logo-full.png'

/**
 * BrandMark - Compact logo icon (without text) enclosed in a white circular container.
 */
export function BrandMark({ className = '' }) {
  return (
    <div className={`navbar-logo-circle ${className}`}>
      <img
        src={logoMarkImg}
        alt="FeatureForge Brand Mark"
        className="brand-logo-img"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
    </div>
  );
}

/**
 * BrandLogo - Full FeatureForge logo with text.
 */
export function BrandLogo({ className = '', height = 28 }) {
  return (
    <img
      src={logoFullImg}
      alt="FeatureForge"
      className={`brand-logo-full ${className}`}
      style={{
        height: `${height}px`,
        objectFit: 'contain',
        display: 'block'
      }}
    />
  );
}
