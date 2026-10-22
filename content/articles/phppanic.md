---
title: PHP releases emergency patches for two critical bugs after government sites go offline
ogTitle: "PHP EMERGENCY PATCHES AFTER CRITICAL BUGS"
description: PHP shipped fixes for CVE-2026-109618 and CVE-2026-109619 on Oct. 21 after governments took websites offline and Cloudflare reported attacks hours before the patch landed.
image: /images/news/phppanic.jpg
imageCaption: "Damage control drills aboard a ship. Photo: U.S. Coast Guard via Wikimedia Commons (public domain)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Damage_Control_Drills_(2888227102).jpg
category: News
data-ai-hint: emergency damage control
publishedDate: '2026-10-22'
lastUpdated: '2026-10-22'
---

PHP released emergency security patches on Wednesday, Oct. 21, fixing two critical vulnerabilities rated 9.2 out of 10 that allow unauthenticated remote code execution on affected servers, after governments in Europe took websites offline as a precaution and Cloudflare reported attacks hours before the fix shipped.

The PHP security team published versions 8.5.12, 8.4.27, 8.3.36, and 8.2.35 shortly before 14:00 UTC, a day earlier than originally scheduled after details leaked publicly, [Decrypt reported](https://decrypt.co/381519/php-panic-critical-bugs-70-percent-internet-risk-everyone-freaking-out). The [security advisory](https://www.php.net/archive/2026.php#2026-10-21-5) stated: "All PHP users are strongly encouraged to update immediately."

The two flaws are tracked as CVE-2026-109618 and CVE-2026-109619. The first appears when PHP runs out of memory midway through handling a request and later treats half-built data as finished. The second lets leftovers from one visitor's request linger in memory where the next request can trip over them. Together they allow a stranger to run commands on a server without logging in, a class of flaw security researchers call unauthenticated remote code execution.

## Governments disconnect services

Finland's state IT provider Valtori began taking government public web services offline. The Netherlands shut its digital identity service, and the country's National Cyber Security Center took its own website offline. France's Interior Ministry temporarily took prefecture websites offline. Germany's federal IT provider ITZBund also disabled several websites, [Cointelegraph reported](https://cointelegraph.com/news/php-foundation-admits-structural-failure-delayed-critical-security-fix), citing Reuters.

In Australia, the Australian Signals Directorate acknowledged that its cybersecurity website was among government sites affected. Japanese Prime Minister Sanae Takaichi urged website operators to prepare to apply the patch, saying that temporarily suspending website functions could reduce risk if the patch could not be applied immediately.

The Wikimedia Foundation said it took some supporting services offline as a precaution, including Toolforge and Cloud VPS, leading to parts of Wikipedia going offline on Wednesday.

## How the flaws were found and disclosed

The PHP Foundation said developers first found signs of the vulnerability in 2024 but struggled to produce a fix without disrupting the large software ecosystem built on PHP. In a blog post following the patch release, the foundation described the stalled response as a "structural failure" caused by both the security team's decision process and a lack of resources.

The issue was pointed to the team again on Aug. 11, after security firm Calif and OpenAI independently reported the same underlying problem, with Calif demonstrating unconditional remote code execution. That raised the issue to a top security priority.

On Tuesday, a post on Hacker News claimed two PHP flaws would be disclosed that Thursday. Security firm watchTowr confirmed the bugs were real and under embargo, and PHP moved its release up a day. Cloudflare CTO Dane Knecht wrote on X early Wednesday, nearly six hours before the patch shipped, that early attacks were already emerging and that the company had pushed emergency firewall rules to every customer, calling them "a stopgap only."

## Crypto industry exposure

Blockchain security firm SlowMist said its MistEye service surveyed PHP use across the crypto industry, identifying 793 domains with direct PHP fingerprints among 1,488 domains assessed, and urged exchanges, DeFi platforms, and wallet providers to review their exposure. Coinbase chief security officer Jeff Lunglhofer said the company found no evidence of any exposed PHP instances. BitGo said its platform was unaffected. Intersect, the membership organization supporting Cardano's development, said it temporarily took its Members Area offline while assessing potential exposure.

PHP only ships official releases for versions 8.2 and newer. The security team published bare-bones source-code patches for 7.4, 8.0, and 8.1, and Linux distributions are backporting fixes. PHP 8.2 reaches end of life on Dec. 31, 2026, after which it gets no more security patches.
