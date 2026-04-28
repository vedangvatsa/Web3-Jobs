import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
 try {
  const [interRegular, interBold] = await Promise.all([
   fetch('https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2A.woff').then((res) => res.arrayBuffer()),
   fetch('https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7SU.woff').then((res) => res.arrayBuffer()),
  ]);

  const { searchParams } = new URL(request.url);
  
  const type = searchParams.get('type') || 'default';
  const title = searchParams.get('title') || 'Web3 Jobs';
  const count = searchParams.get('count');
  const salary = searchParams.get('salary');
  const category = searchParams.get('category');
  const date = searchParams.get('date') || '2026';

  const baseContainerStyle = {
   height: '100%',
   width: '100%',
   display: 'flex',
   fontFamily: 'Inter',
  } as const;

  const baseCardStyle = {
   display: 'flex',
   flexDirection: 'column',
   alignItems: 'center',
   justifyContent: 'center',
   padding: '60px',
   backgroundColor: 'hsl(240 5% 12% / 0.78)',
   borderRadius: '28px',
   border: '1px solid hsl(240 5% 65% / 0.2)',
   boxShadow: '0 30px 80px hsl(240 10% 3.9% / 0.7), inset 0 1px 0 hsl(0 0% 100% / 0.05)',
  } as const;

  const backgroundStyle = {
   backgroundColor: 'hsl(240 6% 10%)',
   backgroundImage: 'radial-gradient(circle at 10% 20%, hsl(205 71% 45% / 0.18), transparent 30%), radial-gradient(circle at 80% 70%, hsl(205 71% 55% / 0.2), transparent 30%), linear-gradient(135deg, hsl(240 6% 10%) 0%, hsl(240 6% 12%) 50%, hsl(240 5% 14%) 100%)',
  } as const;

  // Default template
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
        maxWidth: '1020px',
       }}
      >
       <h1
        style={{
         fontSize: '72px',
         fontWeight: 'bold',
         background: 'linear-gradient(90deg, hsl(205 71% 45%) 0%, hsl(205 71% 55%) 60%, hsl(205 71% 63%) 100%)',
         backgroundClip: 'text',
         color: 'transparent',
         marginBottom: '20px',
         textAlign: 'center',
         letterSpacing: '-1px',
        }}
       >
        {title}
       </h1>
       <p
        style={{
         fontSize: '32px',
         color: 'hsl(240 5% 65%)',
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
     fonts: [
      { name: 'Inter', data: interRegular, weight: 500, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
     ],
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
       }}
      >
       {count && (
        <div
         style={{
          fontSize: '96px',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, hsl(205 71% 45%) 0%, hsl(205 71% 55%) 60%, hsl(205 71% 63%) 100%)',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: '20px',
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
         color: 'hsl(0 0% 98%)',
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
          padding: '14px 24px',
          backgroundColor: 'hsl(205 71% 45% / 0.16)',
          border: '1px solid hsl(205 71% 45% / 0.35)',
          borderRadius: '999px',
         }}
        >
         <div
          style={{
           fontSize: '36px',
           color: 'hsl(205 71% 63%)',
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
         color: 'hsl(240 5% 65%)',
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
     fonts: [
      { name: 'Inter', data: interRegular, weight: 500, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
     ],
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
       padding: '60px',
      }}
     >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
       {category && (
        <div
         style={{
          display: 'inline-block',
          padding: '10px 22px',
          backgroundColor: 'hsl(205 71% 45% / 0.16)',
          border: '1px solid hsl(205 71% 45% / 0.35)',
          borderRadius: '999px',
          fontSize: '24px',
          color: 'hsl(205 71% 63%)',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
         }}
        >
         {category}
        </div>
       )}
       <h1
        style={{
         fontSize: '64px',
         fontWeight: 'bold',
         color: 'hsl(0 0% 98%)',
         lineHeight: '1.2',
         maxWidth: '1000px',
         letterSpacing: '-0.5px',
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
          padding: '14px 24px',
          backgroundColor: 'hsl(205 71% 45% / 0.16)',
          border: '1px solid hsl(205 71% 45% / 0.35)',
          borderRadius: '999px',
          fontSize: '28px',
          color: 'hsl(205 71% 63%)',
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
         color: 'hsl(240 5% 65%)',
        }}
       >
        Hashtag Web3
       </p>
       <div
        style={{
         width: '8px',
         height: '8px',
         borderRadius: '50%',
         backgroundColor: 'hsl(205 71% 55%)',
        }}
       />
       <p
        style={{
         fontSize: '28px',
         color: 'hsl(240 5% 65%)',
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
     fonts: [
      { name: 'Inter', data: interRegular, weight: 500, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
     ],
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
       }}
      >
       <h1
        style={{
         fontSize: '64px',
         fontWeight: 'bold',
         background: 'linear-gradient(90deg, hsl(205 71% 45%) 0%, hsl(205 71% 55%) 60%, hsl(205 71% 63%) 100%)',
         backgroundClip: 'text',
         color: 'transparent',
         marginBottom: '24px',
         textAlign: 'center',
         letterSpacing: '-0.5px',
        }}
       >
        {title}
       </h1>
       {count && (
        <div
         style={{
          fontSize: '40px',
          color: 'hsl(0 0% 98%)',
          marginBottom: '16px',
         }}
        >
         🚀 {count} Open Positions
        </div>
       )}
       <p
        style={{
         fontSize: '28px',
         color: 'hsl(240 5% 65%)',
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
     fonts: [
      { name: 'Inter', data: interRegular, weight: 500, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
     ],
    }
   );
  }

  return new ImageResponse(
   (
    <div
     style={{
      ...baseContainerStyle,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'hsl(240 6% 10%)',
     }}
    >
     <h1 style={{ fontSize: '48px', color: 'hsl(0 0% 98%)', fontWeight: '700' }}>Invalid template type</h1>
    </div>
   ),
   {
    width: 1200,
    height: 630,
    fonts: [
     { name: 'Inter', data: interRegular, weight: 500, style: 'normal' },
     { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
    ],
   }
  );
 } catch (e: any) {
  console.log(`${e.message}`);
  return new Response(`Failed to generate the image`, {
   status: 500,
  });
 }
}
