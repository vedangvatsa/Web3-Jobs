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
    const category = searchParams.get('category');
    const date = searchParams.get('date') || '2026';
    const slide = searchParams.get('slide'); // 'cover', 'content', 'cta'
    const slideNumber = searchParams.get('num') || '1';
    const totalSlides = searchParams.get('total') || '5';
    const subtitle = searchParams.get('subtitle') || '';
    const bodyText = searchParams.get('body') || '';
    const tagline = searchParams.get('tagline') || 'Subscribed by 60k+ Web3 builders and professionals.';

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

    // 0. Dedicated Instagram Advice Carousel Templates (1080x1080 Square, Light Mode)
    if (type === 'advice-slide' || type === 'advice-cover' || type === 'advice-cta') {
      const isCover = type === 'advice-cover' || slide === 'cover';
      const isCta = type === 'advice-cta' || slide === 'cta';
      const displayCategory = (category || 'Career Guides').toUpperCase();
      const displayTitle = title.length > 90 ? `${title.slice(0, 87)}...` : title;

      return new ImageResponse(
        (
          <div
            style={{
              ...baseContainerStyle,
              width: '1080px',
              height: '1080px',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px',
            }}
          >
            <div
              style={{
                ...baseCardStyle,
                width: '984px',
                height: '984px',
                padding: '64px 56px',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              {/* Header: Category Badge & Slide Progress */}
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
                    gap: '10px',
                    padding: '8px 18px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '999px',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#0284c7',
                    letterSpacing: '0.6px',
                  }}
                >
                  {displayCategory}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#94a3b8',
                    letterSpacing: '0.5px',
                  }}
                >
                  {slideNumber} / {totalSlides}
                </div>
              </div>

              {/* Main Content Body */}
              {isCover ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: '24px',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: displayTitle.length > 50 ? '58px' : '68px',
                      fontWeight: '900',
                      color: '#0f172a',
                      lineHeight: '1.16',
                      letterSpacing: '-2px',
                    }}
                  >
                    {displayTitle}
                  </div>
                  {subtitle ? (
                    <div
                      style={{
                        display: 'flex',
                        fontSize: '28px',
                        fontWeight: '500',
                        color: '#475569',
                        lineHeight: '1.45',
                        maxWidth: '850px',
                      }}
                    >
                      {subtitle}
                    </div>
                  ) : null}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '16px',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#0284c7',
                    }}
                  >
                    Swipe to read →
                  </div>
                </div>
              ) : isCta ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '32px',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '64px',
                      fontWeight: '900',
                      color: '#0f172a',
                      letterSpacing: '-2px',
                    }}
                  >
                    hashtagweb3.com
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '30px',
                      fontWeight: '500',
                      color: '#475569',
                      maxWidth: '750px',
                      lineHeight: '1.4',
                    }}
                  >
                    {tagline}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: '24px',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '46px',
                      fontWeight: '800',
                      color: '#0f172a',
                      lineHeight: '1.2',
                      letterSpacing: '-1px',
                    }}
                  >
                    {displayTitle}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '26px',
                      fontWeight: '450',
                      color: '#334155',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {bodyText}
                  </div>
                </div>
              )}

              {/* Footer: Domain & Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '24px',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#0284c7',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: '800',
                      color: '#0f172a',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    hashtagweb3.com
                  </div>
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
          width: 1080,
          height: 1080,
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        }
      );
    }

    // 1. Dedicated Job Posting Template (Clean, Minimalist, Big & Symmetric)
    if (type === 'job') {
      const displayTitle = title.length > 70 ? `${title.slice(0, 67)}...` : title;
      const displayCompany = company || 'Web3 Company';
      const companySlug = displayCompany.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Resolve company logo / favicon (passed in URL or derived via Google favicon service)
      const logoParam = searchParams.get('logo');
      let companyLogoUrl: string | null = null;

      if (logoParam && logoParam.trim()) {
        const cleaned = logoParam.trim().replace(/\.webp$/i, '.png');
        if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('data:')) {
          companyLogoUrl = cleaned;
        } else {
          companyLogoUrl = `https://hashtagweb3.com${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
        }
      } else if (companySlug) {
        const domain = companySlug === 'franklin-templeton' || companySlug === 'franklintempleton'
          ? 'careers.franklintempleton.com'
          : `${companySlug.replace(/-/g, '')}.com`;
        companyLogoUrl = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
      }

      // Dynamic font sizing for maximum visual punch and symmetry
      const titleFontSize = displayTitle.length > 55
        ? '60px'
        : displayTitle.length > 35
        ? '72px'
        : displayTitle.length > 20
        ? '86px'
        : '100px';

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
                padding: '48px 64px',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '32px',
              }}
            >
              {/* Top Center: Company Logo / Favicon */}
              {companyLogoUrl ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '96px',
                    height: '96px',
                    borderRadius: '24px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    padding: '12px',
                  }}
                >
                  <img
                    src={companyLogoUrl}
                    width={72}
                    height={72}
                    style={{ borderRadius: '14px' }}
                    alt={`${displayCompany} logo`}
                  />
                </div>
              ) : null}

              {/* Middle: Centered text: {Company} is hiring (no pill, larger font) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: '48px',
                    fontWeight: '800',
                    color: '#0284c7',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {displayCompany}
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '48px',
                    fontWeight: '500',
                    color: '#475569',
                    letterSpacing: '-0.5px',
                  }}
                >
                  is hiring
                </div>
              </div>

              {/* Centered Big Role Title */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: titleFontSize,
                  fontWeight: '900',
                  color: '#0f172a',
                  lineHeight: '1.14',
                  letterSpacing: '-2px',
                  maxWidth: '1020px',
                  padding: '0 20px',
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

    // 4. Article template (Split card style inspired by cvin.bio/blog)
    if (type === 'article') {
      const displayTitle = title.length > 80 ? `${title.slice(0, 77)}...` : title;
      const displayCategory = (category || 'Web3 & AI Insights').toUpperCase();

      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f4f4f5',
              padding: '36px',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '1128px',
                height: '558px',
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e4e4e7',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
                overflow: 'hidden',
              }}
            >
              {/* Left Column - 58% Width: Category, Title, Footer */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '58%',
                  padding: '52px 48px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Tag Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        padding: '6px 14px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#475569',
                        letterSpacing: '0.8px',
                      }}
                    >
                      {displayCategory}
                    </div>
                  </div>

                  {/* Main Article Title */}
                  <div
                    style={{
                      display: 'flex',
                      fontSize: displayTitle.length > 60 ? '38px' : displayTitle.length > 40 ? '44px' : '50px',
                      fontWeight: '800',
                      color: '#0f172a',
                      lineHeight: '1.18',
                      letterSpacing: '-1.5px',
                    }}
                  >
                    {displayTitle}
                  </div>
                </div>

                {/* Footer Brand Watermark */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
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
                        color: '#0f172a',
                        letterSpacing: '-0.3px',
                      }}
                    >
                      hashtagweb3.com
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#94a3b8',
                    }}
                  >
                    {date}
                  </div>
                </div>
              </div>

              {/* Right Column - 42% Width: Modern Sleek Abstract Tech Card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42%',
                  height: '100%',
                  backgroundColor: '#0f172a',
                  backgroundImage:
                    'radial-gradient(circle at 80% 20%, #0284c7 0%, transparent 45%), radial-gradient(circle at 20% 80%, #38bdf8 0%, transparent 40%), linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  padding: '40px',
                  position: 'relative',
                }}
              >
                {/* Abstract Visual Geometry Overlay */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '260px',
                    height: '260px',
                    borderRadius: '28px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '42px',
                      fontWeight: '900',
                      color: '#ffffff',
                      letterSpacing: '-1px',
                      marginBottom: '8px',
                    }}
                  >
                    #WEB3
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#38bdf8',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    PLAYBOOK
                  </div>
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
