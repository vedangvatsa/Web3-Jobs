import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'default';
    const title = searchParams.get('title') || 'Hashtag Web3';
    const company = searchParams.get('company') || '';
    const location = searchParams.get('location') || 'Remote';
    const department = searchParams.get('department') || '';
    const count = searchParams.get('count');
    const salary = searchParams.get('salary');
    const category = searchParams.get('category');
    const date = searchParams.get('date') || '2026';

    const baseContainerStyle = {
      height: '100%',
      width: '100%',
      display: 'flex',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      backgroundImage:
        'radial-gradient(circle at 10% 15%, rgba(2, 132, 199, 0.08), transparent 35%), radial-gradient(circle at 90% 85%, rgba(14, 165, 233, 0.06), transparent 35%), linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    } as const;

    const baseCardStyle = {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
    } as const;

    // 1. Dedicated Job Posting Template (Light, Crisp, Modern Editorial)
    if (type === 'job') {
      const displayTitle = title.length > 55 ? `${title.slice(0, 52)}...` : title;
      const displayCompany = company || 'Web3 Company';
      const displayLocation = location || 'Remote';

      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                width: '1120px',
                height: '550px',
                padding: '48px 56px',
                justifyContent: 'space-between',
              }}
            >
              {/* Top Row: Brand & Status Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 18px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '999px',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#0284c7',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#0284c7',
                      letterSpacing: '0.5px',
                    }}
                  >
                    HASHTAG WEB3 • VERIFIED OPENING
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 16px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '999px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#059669',
                  }}
                >
                  ✓ Direct ATS Apply
                </div>
              </div>

              {/* Middle Section: Company & Role Title */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '26px',
                    fontWeight: '700',
                    color: '#0284c7',
                  }}
                >
                  <span>{displayCompany}</span>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>is hiring</span>
                </div>

                <h1
                  style={{
                    fontSize: displayTitle.length > 35 ? '48px' : '56px',
                    fontWeight: '800',
                    color: '#0f172a',
                    margin: 0,
                    lineHeight: '1.15',
                    letterSpacing: '-1px',
                  }}
                >
                  {displayTitle}
                </h1>
              </div>

              {/* Meta Badges Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#334155',
                  }}
                >
                  📍 {displayLocation}
                </div>

                {department && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 20px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#334155',
                    }}
                  >
                    🏷️ {department}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#334155',
                  }}
                >
                  ⚡ Web3 / Blockchain
                </div>
              </div>

              {/* Bottom Row: Footer Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#0284c7',
                  }}
                >
                  HashtagWeb3.com
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#94a3b8',
                  }}
                >
                  Explore Top Crypto & Web3 Careers • {date}
                </div>
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

    // 2. Default & Tool template (Light Mode)
    if (type === 'default') {
      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                width: '1080px',
                padding: '60px',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                  padding: '8px 24px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '999px',
                  fontSize: '20px',
                  color: '#0284c7',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                }}
              >
                HASHTAG WEB3
              </div>
              <h1
                style={{
                  fontSize: title.length > 35 ? '50px' : '62px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '20px',
                  textAlign: 'center',
                  letterSpacing: '-1px',
                  lineHeight: '1.2',
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: '24px',
                  color: '#64748b',
                  textAlign: 'center',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                Web3 Careers • Verified Job Board • Salary Data • {date}
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

    // 3. Jobs page aggregate template (Light Mode)
    if (type === 'jobs') {
      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                width: '1040px',
                padding: '60px',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {count && (
                <div
                  style={{
                    fontSize: '84px',
                    fontWeight: '800',
                    color: '#0284c7',
                    marginBottom: '8px',
                    letterSpacing: '-2px',
                  }}
                >
                  {count}+
                </div>
              )}
              <h1
                style={{
                  fontSize: '54px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '-1px',
                }}
              >
                Live Web3 & Crypto Jobs
              </h1>
              {salary && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px',
                    padding: '10px 24px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '999px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '28px',
                      color: '#0284c7',
                      fontWeight: '700',
                    }}
                  >
                    {salary}
                  </div>
                </div>
              )}
              <p
                style={{
                  fontSize: '24px',
                  color: '#64748b',
                  textAlign: 'center',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                Remote • Blockchain • DeFi • Smart Contracts • {date}
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

    // 4. Article template (Light Mode)
    if (type === 'article') {
      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                width: '1120px',
                height: '550px',
                padding: '48px 56px',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                {category && (
                  <div
                    style={{
                      display: 'flex',
                      alignSelf: 'flex-start',
                      padding: '8px 20px',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '999px',
                      fontSize: '18px',
                      color: '#0284c7',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {category}
                  </div>
                )}
                <h1
                  style={{
                    fontSize: title.length > 55 ? '46px' : '54px',
                    fontWeight: '800',
                    color: '#0f172a',
                    lineHeight: '1.2',
                    maxWidth: '1020px',
                    letterSpacing: '-1px',
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
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#0284c7',
                  }}
                >
                  HashtagWeb3.com
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#94a3b8',
                  }}
                >
                  {date}
                </div>
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

    // 5. Company template (Light Mode)
    if (type === 'company') {
      const safeTitle = (title || 'Hashtag Web3').slice(0, 80);
      const safeCount = count ? String(count).slice(0, 10) : null;

      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                width: '1040px',
                padding: '60px',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: safeTitle.length > 24 ? '52px' : '62px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '-1px',
                  lineHeight: '1.15',
                }}
              >
                {safeTitle}
              </h1>
              {safeCount && (
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#0284c7',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}
                >
                  {safeCount} Open Positions
                </div>
              )}
              <p
                style={{
                  fontSize: '24px',
                  color: '#64748b',
                  textAlign: 'center',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                Explore Web3 Careers & Ecosystem Roles • {date}
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
