// Instagram Insights Scraper for @networkschool
// 
// HOW TO USE:
// 1. Go to: https://www.instagram.com/networkschool/
// 2. Open browser DevTools (Cmd+Option+I)
// 3. Go to Console tab
// 4. Paste this entire script and press Enter
// 5. Wait ~60 seconds for it to finish
// 6. A CSV file will auto-download
//
// This uses Instagram's internal GraphQL API with your logged-in session.

(async function scrapeNetworkSchool() {
  const username = 'networkschool';
  const YEAR = 2026;
  
  console.log('🔄 Fetching @' + username + ' profile...');
  
  // Step 1: Get user ID from profile page
  const profileRes = await fetch(`/api/v1/users/web_profile_info/?username=${username}`, {
    headers: { 'X-IG-App-ID': '936619743392459' }
  });
  const profileData = await profileRes.json();
  const user = profileData.data?.user;
  
  if (!user) {
    console.error('❌ Could not find user. Make sure you are logged in.');
    return;
  }
  
  const userId = user.id;
  const accountName = user.full_name;
  console.log(`✅ Found: ${accountName} (ID: ${userId})`);
  
  // Step 2: Fetch all posts using pagination
  const allPosts = [];
  let hasNext = true;
  let endCursor = '';
  
  // Initial posts from profile
  const edges = user.edge_owner_to_timeline_media?.edges || [];
  for (const edge of edges) {
    allPosts.push(edge.node);
  }
  hasNext = user.edge_owner_to_timeline_media?.page_info?.has_next_page || false;
  endCursor = user.edge_owner_to_timeline_media?.page_info?.end_cursor || '';
  
  console.log(`📦 Initial batch: ${allPosts.length} posts`);
  
  // Paginate to get more
  while (hasNext) {
    const variables = JSON.stringify({ id: userId, first: 50, after: endCursor });
    const queryHash = '69cba40317214236af40e7efa697781d'; // edge_owner_to_timeline_media
    
    try {
      const res = await fetch(
        `/graphql/query/?query_hash=${queryHash}&variables=${encodeURIComponent(variables)}`,
        { headers: { 'X-IG-App-ID': '936619743392459' } }
      );
      const data = await res.json();
      const media = data.data?.user?.edge_owner_to_timeline_media;
      
      if (!media?.edges?.length) break;
      
      for (const edge of media.edges) {
        const ts = edge.node.taken_at_timestamp;
        const postYear = new Date(ts * 1000).getFullYear();
        
        // Stop if we've gone past our target year
        if (postYear < YEAR) { hasNext = false; break; }
        
        allPosts.push(edge.node);
      }
      
      hasNext = hasNext && (media.page_info?.has_next_page || false);
      endCursor = media.page_info?.end_cursor || '';
      
      console.log(`  Fetched ${allPosts.length} posts so far...`);
      
      // Rate limit: wait 2 seconds between requests
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error('Pagination error:', e);
      break;
    }
  }
  
  // Step 3: Filter to 2026 only
  const posts2026 = allPosts.filter(p => {
    const d = new Date(p.taken_at_timestamp * 1000);
    return d.getFullYear() === YEAR;
  });
  
  console.log(`\n✅ Found ${posts2026.length} posts from ${YEAR}`);
  
  // Step 4: Format as CSV
  const rows = posts2026.map(p => {
    const date = new Date(p.taken_at_timestamp * 1000);
    const caption = (p.edge_media_to_caption?.edges?.[0]?.node?.text || '').replace(/[\n\r,]/g, ' ').substring(0, 300);
    const isVideo = p.is_video;
    const isCarousel = p.__typename === 'GraphSidecar';
    const postType = isCarousel ? 'Carousel' : (isVideo ? 'Video/Reel' : 'Photo');
    const permalink = `https://www.instagram.com/p/${p.shortcode}/`;
    const likes = p.edge_media_preview_like?.count ?? p.edge_liked_by?.count ?? '';
    const comments = p.edge_media_to_comment?.count ?? p.edge_media_preview_comment?.count ?? '';
    const views = p.video_view_count || '';
    const duration = p.video_duration || '';
    
    return {
      'Post ID': p.id,
      'Account ID': userId,
      'Account username': username,
      'Account name': accountName,
      'Description': caption,
      'Duration (sec)': duration,
      'Publish time': date.toISOString(),
      'Permalink': permalink,
      'Post type': postType,
      'Data comment': '',
      'Date': date.toISOString().split('T')[0],
      'Views': views,
      'Reach': '',  // Private metric - not available via public API
      'Likes': likes,
      'Shares': '', // Private metric
      'Follows': '', // Private metric
      'Comments': comments,
      'Saves': '',  // Private metric
    };
  });
  
  // Generate CSV
  const headers = Object.keys(rows[0] || {});
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(h => {
      const val = String(row[h] || '');
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(','))
  ].join('\n');
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `networkschool_instagram_${YEAR}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log(`\n📥 CSV downloaded: networkschool_instagram_${YEAR}.csv`);
  console.log(`Total posts: ${rows.length}`);
  
  // Also log summary table
  console.table(rows.map(r => ({
    Date: r.Date,
    Type: r['Post type'],
    Likes: r.Likes,
    Comments: r.Comments,
    Views: r.Views,
    Caption: r.Description.substring(0, 60) + '...',
  })));
})();
