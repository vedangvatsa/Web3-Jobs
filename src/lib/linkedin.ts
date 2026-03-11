/**
 * LinkedIn API integration for posting jobs and content
 * Docs: https://docs.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api
 */

const LINKEDIN_API_BASE = 'https://api.linkedin.com/rest';

export interface LinkedInPostOptions {
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
}

/**
 * Post content to LinkedIn company page
 */
export async function postToLinkedIn(options: LinkedInPostOptions) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const organizationId = process.env.LINKEDIN_ORG_ID || '89714573';

  if (!accessToken) {
    throw new Error('LINKEDIN_ACCESS_TOKEN not set');
  }

  try {
    // Register upload if image provided
    let imageUrn = null;
    if (options.imageUrl) {
      imageUrn = await registerLinkedInImage(options.imageUrl, accessToken, organizationId);
    }

    // Create post content
    const postContent: any = {
      commentary: options.content,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
    };

    // Add image if available
    if (imageUrn) {
      postContent.media = [
        {
          status: 'READY',
          media: imageUrn,
        },
      ];
    }

    // Add article link if provided
    if (options.linkUrl) {
      postContent.content = {
        contentEntities: [
          {
            entityLocation: options.linkUrl,
            thumbnails: [],
          },
        ],
        title: options.linkTitle || 'View Job',
        description: options.linkDescription,
      };
    }

    const response = await fetch(`${LINKEDIN_API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202405',
      },
      body: JSON.stringify({
        author: `urn:li:organization:${organizationId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': postContent,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      postId: data.id,
      url: `https://www.linkedin.com/feed/update/${data.id}`,
      success: true,
    };
  } catch (error) {
    console.error('Failed to post to LinkedIn:', error);
    throw error;
  }
}

/**
 * Register an image for LinkedIn posting
 */
async function registerLinkedInImage(
  imageUrl: string,
  accessToken: string,
  organizationId: string
): Promise<string> {
  try {
    // Initiate upload
    const registerResponse = await fetch(
      `${LINKEDIN_API_BASE}/assets?action=registerUpload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': '202405',
        },
        body: JSON.stringify({
          registerUploadRequest: {
            owner: `urn:li:organization:${organizationId}`,
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent',
              },
            ],
          },
        }),
      }
    );

    if (!registerResponse.ok) {
      throw new Error(`Failed to register image: ${registerResponse.statusText}`);
    }

    const registerData = await registerResponse.json();
    const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
      .uploadUrl;
    const assetId = registerData.value.asset;

    // Download image and upload
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    return assetId;
  } catch (error) {
    console.error('Failed to register LinkedIn image:', error);
    // Return null if image registration fails - post will work without image
    return null as any;
  }
}

/**
 * Format a job posting for LinkedIn
 */
export function formatJobForLinkedIn(job: any): LinkedInPostOptions {
  const salaryText = job.salary ? `💰 ${job.salary}\n` : '';
  const locationText = job.location ? `📍 ${job.location}\n` : '';

  return {
    content: `🚀 We're Hiring: ${job.title}\n\n${salaryText}${locationText}${job.company ? `@ ${job.company}\n` : ''}#Web3 #Blockchain #Hiring #Jobs`,
    linkUrl: job.applicationUrl || job.url,
    linkTitle: `Apply Now: ${job.title}`,
    linkDescription: job.description?.substring(0, 150) || job.company,
    imageUrl: job.companyLogo,
  };
}

/**
 * Get LinkedIn access token (requires prior OAuth authorization)
 * This is called during the OAuth callback setup
 */
export async function getLinkedInAccessToken(code: string): Promise<string> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';

  if (!clientId || !clientSecret) {
    throw new Error('LinkedIn credentials not configured');
  }

  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to get LinkedIn access token:', error);
    throw error;
  }
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(state: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId || '',
    redirect_uri: redirectUri,
    state,
    scope: 'w_member_social w_organization_social',
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}
