import { useNavigate, useLocation } from 'react-router-dom'
import { BrandMark } from '../components/landing/Brand'

export default function AcceptInvite() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAccept = () => {
    navigate('/app/overview');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#FAF8F3',
      fontFamily: 'var(--sans)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(38, 37, 33, 0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <BrandMark />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Workspace Invitation
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '24px' }}>
          You have been invited to collaborate on this workspace. Accept to join and start managing flags.
        </p>

        <button onClick={handleAccept} style={{
          width: '100%',
          padding: '14px',
          borderRadius: '30px',
          border: 'none',
          backgroundColor: 'var(--charcoal)',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Accept Invitation
        </button>
      </div>
    </div>
  )
}
