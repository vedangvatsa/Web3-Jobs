import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || 'default';
    const title = searchParams.get('title') || 'Web3 Jobs';
    const count = searchParams.get('count');
    const salary = searchParams.get('salary');
    const category = searchParams.get('category');
    const date = searchParams.get('date') || '2026';

    // Default template
    if (type === 'default') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0a0a0a',
              backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
              backgroundSize: '100px 100px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '24px',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                maxWidth: '1000px',
              }}
            >
              <h1
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: '32px',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                Hashtag Web3 • {date}
              </p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Jobs page template
    if (type === 'jobs') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0a0a0a',
              backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
              backgroundSize: '100px 100px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderRadius: '24px',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                maxWidth: '1000px',
              }}
            >
              {count && (
                <div
                  style={{
                    fontSize: '96px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                    backgroundClip: 'text',
                    color: 'transparent',
                    marginBottom: '20px',
                  }}
                >
                  {count}+
                </div>
              )}
              <h1
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#f1f5f9',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                Live Web3 Jobs
              </h1>
              {salary && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '36px',
                      color: '#22c55e',
                      fontWeight: 'bold',
                    }}
                  >
                    💰 {salary}
                  </div>
                </div>
              )}
              <p
                style={{
                  fontSize: '28px',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                Remote • Crypto • Blockchain • DeFi • {date}
              </p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Article template
    if (type === 'article') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              backgroundColor: '#0a0a0a',
              backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
              backgroundSize: '100px 100px',
              padding: '60px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {category && (
                <div
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '2px solid rgba(59, 130, 246, 0.5)',
                    borderRadius: '12px',
                    fontSize: '24px',
                    color: '#60a5fa',
                    fontWeight: 'bold',
                  }}
                >
                  {category}
                </div>
              )}
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#f1f5f9',
                  lineHeight: '1.2',
                  maxWidth: '1000px',
                }}
              >
                {title}
              </h1>
              {salary && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 28px',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    border: '2px solid rgba(34, 197, 94, 0.4)',
                    borderRadius: '12px',
                    fontSize: '28px',
                    color: '#22c55e',
                    fontWeight: 'bold',
                  }}
                >
                  💰 {salary}
                </div>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <p
                style={{
                  fontSize: '28px',
                  color: '#94a3b8',
                }}
              >
                Hashtag Web3
              </p>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#60a5fa',
                }}
              />
              <p
                style={{
                  fontSize: '28px',
                  color: '#94a3b8',
                }}
              >
                {date}
              </p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Company template
    if (type === 'company') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0a0a0a',
              backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
              backgroundSize: '100px 100px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderRadius: '24px',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                maxWidth: '900px',
              }}
            >
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                {title}
              </h1>
              {count && (
                <div
                  style={{
                    fontSize: '40px',
                    color: '#f1f5f9',
                    marginBottom: '16px',
                  }}
                >
                  🚀 {count} Open Positions
                </div>
              )}
              <p
                style={{
                  fontSize: '28px',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                Explore Web3 Careers • {date}
              </p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
          }}
        >
          <h1 style={{ fontSize: '48px', color: '#fff' }}>Invalid template type</h1>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
