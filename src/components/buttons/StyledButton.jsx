import React from 'react'
import styles from './StyledButton.module.css'

function StyledButton({ children, onClick, className = '' }) {
  return (
    <button 
      onClick={onClick}
      className={`${styles.button} ${className === 'red' ? styles.red : ''}`}
      style={{
        '--😀': '#644dff',
        '--😀😀': '#4836bb',
        '--😀😀😀': '#654dff63',
      }}
    >
      {children}
    </button>
  )
}

export default StyledButton 