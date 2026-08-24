import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'default';
    const title = searchParams.get('title') || 'Hashtag Web3';
    const count = searchParams.get('count');
    const salary = searchParams.get('salary');
    const category = searchParams.get('category');
    const date = searchParams.get('date') || '2026';

    const baseContainerStyle = {
      height: '100%',
      width: '100%',
      display: 'flex',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    } as const;

    const baseCardStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px',
      backgroundColor: 'rgba(24, 24, 27, 0.85)',
      borderRadius: '28px',
      border: '1px solid rgba(161, 161, 170, 0.25)',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7)',
    } as const;

    const backgroundStyle = {
      backgroundColor: '#09090b',
      backgroundImage:
        'radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.22), transparent 40%), radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.22), transparent 40%), linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
    } as const;

    // Default & Tool template
    if (type === 'default') {
      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              ...backgroundStyle,
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                maxWidth: '1060px',
                width: '90%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '8px 20px',
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  border: '1px solid rgba(14, 165, 233, 0.35)',
                  borderRadius: '999px',
                  fontSize: '22px',
                  color: '#38bdf8',
                  fontWeight: 'bold',
                }}
              >
                HASHTAG WEB3
              </div>
              <h1
                style={{
                  fontSize: title.length > 35 ? '54px' : '68px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '24px',
                  textAlign: 'center',
                  letterSpacing: '-1px',
                  lineHeight: '1.15',
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: '28px',
                  color: '#a1a1aa',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                Web3 Careers • Job Board • Salary Data • {date}
              </p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        }
      );
    }

    // Jobs page template
    if (type === 'jobs') {
      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              ...backgroundStyle,
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                maxWidth: '1020px',
                width: '88%',
              }}
            >
              {count && (
                <div
                  style={{
                    fontSize: '84px',
                    fontWeight: 'bold',
                    color: '#38bdf8',
                    marginBottom: '12px',
                    letterSpacing: '-1px',
                  }}
                >
                  {count}+
                </div>
              )}
              <h1
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '-0.5px',
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
                    padding: '12px 24px',
                    backgroundColor: 'rgba(14, 165, 233, 0.16)',
                    border: '1px solid rgba(14, 165, 233, 0.35)',
                    borderRadius: '999px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '32px',
                      color: '#38bdf8',
                      fontWeight: 'bold',
                    }}
                  >
                    💰 {salary}
                  </div>
                </div>
              )}
              <p
                style={{
                  fontSize: '26px',
                  color: '#a1a1aa',
                  textAlign: 'center',
                  margin: 0,
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
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        }
      );
    }

    // Article template
    if (type === 'article') {
      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              ...backgroundStyle,
              padding: '60px 80px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
              {category && (
                <div
                  style={{
                    display: 'flex',
                    alignSelf: 'flex-start',
                    padding: '10px 22px',
                    backgroundColor: 'rgba(14, 165, 233, 0.16)',
                    border: '1px solid rgba(14, 165, 233, 0.35)',
                    borderRadius: '999px',
                    fontSize: '22px',
                    color: '#38bdf8',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                  }}
                >
                  {category}
                </div>
              )}
              <h1
                style={{
                  fontSize: title.length > 55 ? '48px' : '60px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  lineHeight: '1.2',
                  maxWidth: '1040px',
                  letterSpacing: '-0.5px',
                  margin: 0,
                }}
              >
                {title}
              </h1>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                borderTop: '1px solid rgba(161, 161, 170, 0.2)',
                paddingTop: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 'bold',
                  color: '#38bdf8',
                }}
              >
                HashtagWeb3.com
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#a1a1aa',
                }}
              >
                {date}
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        }
      );
    }

    // Company template
    if (type === 'company') {
      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              ...backgroundStyle,
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                maxWidth: '980px',
                width: '88%',
              }}
            >
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#38bdf8',
                  marginBottom: '20px',
                  textAlign: 'center',
                  letterSpacing: '-0.5px',
                }}
              >
                {title}
              </h1>
              {count && (
                <div
                  style={{
                    fontSize: '36px',
                    color: '#ffffff',
                    marginBottom: '16px',
                  }}
                >
                  🚀 {count} Open Positions
                </div>
              )}
              <p
                style={{
                  fontSize: '26px',
                  color: '#a1a1aa',
                  textAlign: 'center',
                  margin: 0,
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
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        }
      );
    }

    // Default fallback
    return NextResponse.redirect(new URL('/og-image.png', request.url), 307);
  } catch (e: any) {
    console.error('OG generation fallback:', e?.message || e);
    return NextResponse.redirect(new URL('/og-image.png', request.url), 307);
  }
}
