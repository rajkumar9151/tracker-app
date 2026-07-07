import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Lock, ArrowRight } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // Beautiful entrance animation
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        backgroundColor: 'rgba(10, 10, 10, 0)',
        duration: 1.5,
        ease: 'power2.inOut',
      });

      gsap.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'back.out(1.7)',
      });

      gsap.from(formRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: 'back.out(1.2)',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'raayan123..') {
      setError(false);
      
      // Success animation before transitioning
      gsap.to(formRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
      });
      
      gsap.to(titleRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        delay: 0.1,
        ease: 'power2.in',
        onComplete: onLoginSuccess
      });
      
      gsap.to(containerRef.current, {
        backgroundColor: 'rgba(10, 10, 10, 0)',
        duration: 0.6,
        delay: 0.2
      });

    } else {
      setError(true);
      // Shake animation for error
      gsap.fromTo(inputRef.current, 
        { x: -10 }, 
        { x: 10, duration: 0.1, yoyo: true, repeat: 5, ease: 'linear', onComplete: () => {
          gsap.set(inputRef.current, { x: 0 });
        }}
      );
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'var(--font-primary, sans-serif)'
      }}
    >
      <div ref={titleRef} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          marginBottom: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}>
          <Lock size={28} color="var(--primary-color)" />
        </div>
        <h1 style={{ 
          margin: 0, 
          fontSize: '2rem', 
          fontWeight: 600, 
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>
          Authentication
        </h1>
        <p style={{ 
          margin: '0.5rem 0 0 0', 
          color: 'var(--text-secondary)',
          fontSize: '1rem'
        }}>
          Enter your password to access the tracker
        </p>
      </div>

      <form 
        ref={formRef} 
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(false);
            }}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--surface-color)',
              border: `1px solid ${error ? 'var(--danger-color)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
            }}
            onFocus={(e) => e.target.style.borderColor = error ? 'var(--danger-color)' : 'var(--primary-color)'}
            onBlur={(e) => e.target.style.borderColor = error ? 'var(--danger-color)' : 'var(--border-color)'}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s, transform 0.1s',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          Access Dashboard <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
