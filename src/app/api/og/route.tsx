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

    // 1. Dedicated Job Posting Template (Clean, Minimalist, High Contrast)
    if (type === 'job') {
      const displayTitle = title.length > 70 ? `${title.slice(0, 67)}...` : title;
      const displayCompany = company || 'Web3 Company';

      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px',
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                width: '1104px',
                height: '534px',
                padding: '64px 72px',
                justifyContent: 'center',
                gap: '24px',
              }}
            >
              {/* Header: {Company} is hiring */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '34px',
                  fontWeight: '700',
                  color: '#0284c7',
                  letterSpacing: '-0.5px',
                }}
              >
                <div style={{ display: 'flex', color: '#0284c7' }}>{displayCompany}</div>
                <div style={{ display: 'flex', color: '#64748b', fontWeight: '500' }}>is hiring</div>
              </div>

              {/* Role Title: {Job Title} */}
              <div
                style={{
                  display: 'flex',
                  fontSize: displayTitle.length > 35 ? '56px' : '68px',
                  fontWeight: '800',
                  color: '#0f172a',
                  lineHeight: '1.15',
                  letterSpacing: '-1.5px',
                }}
              >
                {displayTitle}
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
              <div
                style={{
                  display: 'flex',
                  fontSize: title.length > 35 ? '48px' : '58px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '20px',
                  textAlign: 'center',
                  letterSpacing: '-1px',
                  lineHeight: '1.2',
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '24px',
                  color: '#64748b',
                  textAlign: 'center',
                  fontWeight: '500',
                }}
              >
                Web3 Careers • Verified Job Board • Salary Data • {date}
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
              <div
                style={{
                  display: 'flex',
                  fontSize: '54px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '-1px',
                }}
              >
                Live Web3 & Crypto Jobs
              </div>
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
              <div
                style={{
                  display: 'flex',
                  fontSize: '24px',
                  color: '#64748b',
                  textAlign: 'center',
                  fontWeight: '500',
                }}
              >
                Remote • Blockchain • DeFi • Smart Contracts • {date}
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
                <div
                  style={{
                    display: 'flex',
                    fontSize: title.length > 55 ? '44px' : '52px',
                    fontWeight: '800',
                    color: '#0f172a',
                    lineHeight: '1.2',
                    maxWidth: '1020px',
                    letterSpacing: '-1px',
                  }}
                >
                  {title}
                </div>
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
              <div
                style={{
                  display: 'flex',
                  fontSize: safeTitle.length > 24 ? '50px' : '60px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '-1px',
                  lineHeight: '1.15',
                }}
              >
                {safeTitle}
              </div>
              {safeCount && (
                <div
                  style={{
                    display: 'flex',
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
              <div
                style={{
                  display: 'flex',
                  fontSize: '24px',
                  color: '#64748b',
                  textAlign: 'center',
                  fontWeight: '500',
                }}
              >
                Explore Web3 Careers & Ecosystem Roles • {date}
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

    // Default fallback
    return NextResponse.redirect(new URL('/og-image.png', request.url), 307);
  } catch (e: any) {
    console.error('OG generation fallback:', e?.message || e);
    return NextResponse.redirect(new URL('/og-image.png', request.url), 307);
  }
}
