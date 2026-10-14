# Registered employer company-profile enrichment

Audited 81 registered sources: **81 unique employers**. The comparison against the existing hiring catalog found 0 additional new hiring records outside these registries. Unreviewed leads and excluded candidates are not profile inputs.

## Results

- Verified official website roots: **81/81**. Careers and ATS URLs remain hiring sources, not company website links.
- Researched company About paragraphs: **81/81**. Copy describes actual products and services without job-count summaries, unsupported funding claims, or inferred legal headquarters.
- Downloaded and validated official brand assets: **81/81**. Images are cached locally; source URLs, timestamps, source SHA-256, and cached SHA-256 are retained. The existing static-image optimizer's transformations retain the original downloaded hash.
- Employers with at least one exact-brand verified social account: **81/81** (55 LinkedIn, 77 X/Twitter, 0 Crunchbase).
- Profile index: **561 → 634** (73 added entries; eight existing entries enriched). Unrelated existing profile rows are checked for exact equality.
- Company runtime catalog: **179 → 256**. The 77 zero-job employer overviews remain accessible and appear in the public catalog and sitemap. The active hiring directory still lists companies with actual eligible jobs.
- Registered employers with current jobs: **4**. Bit2Me's imported job cmp117 is retained with its original date and application link.

## Field gaps

Employers without any verified social account: **0**. double jump.tokyo's final gap was resolved using its [company-published press release](https://www.doublejump.tokyo/post/N-Suite-Partners-with-Pacific-Meta/), which links [the corporate X account](https://x.com/doublejumptokyo), and its [public LinkedIn company page](https://www.linkedin.com/company/doublejump-tokyo/), whose Website field points to doublejump.tokyo. Its [English X account](https://twitter.com/doublejump_en) is also explicitly identified in a [company release](https://www.doublejump.tokyo/post/KOvjaMqc/); the single Twitter field uses the Japanese corporate account. Source timestamps, HTML-body SHA-256 hashes, and evidence excerpts are retained in the research record and override provenance.

Individual platform fields are also omitted when the official sources do not establish them. The table below and `content/sources/company-profile-completion.json` identify every omission. Founder accounts, customer testimonials, unrelated partner accounts, and share/login URLs are excluded.

## Pipeline and identity

`content/company-profile-overrides.json` is the durable verified input to the existing company-profile generator. It takes precedence over ATS-derived website links, generic listing summaries, and older hardcoded company metadata. The generated company runtime, static mirrors, page metadata, sitemap, social previews, logo resolver, and standalone package consume that same input through the existing pipeline.

Only verified, explicitly published profiles persist without jobs. Job age and original-date provenance checks remain in place. Existing source registries and date-history files retain their hashes; retained hiring records and existing job aliases retain their field-level hashes. Expired jobs are retired through the existing catalog generator.

Axiom at axiom.xyz remains separate from Axiom (Onchain Trading). Eco uses `/eco-protocol`; `/eco` remains the existing job URL. BOB, Liminal, and Kappa Lab aliases resolve to their canonical companies. No Conduit brand substitution or profile for the excluded Presto, Superlinked, Moto, or Ethena-vendor candidates was introduced.

## Verification

Production standalone checks passed for **81 company pages**, their crawler shells, website/About/social metadata, official images, OG assets, and public catalog rows. Hydrated browser samples: bit2me, coinmotion, axiom, eco-protocol, double-jump-tokyo. The test launches its own server on an unused port and does not submit forms or contact external analytics services.

Commands:
```sh
npm run typecheck
npm run test:expansion-company-profiles
npm run test:expansion-company-profiles:browser
npm run test:company-jobs
npm run test:job-age
npm run test:catalog-publication
npm run test:prebuild-invalidation
npm run test:site-catalog-integrity
npx tsx scripts/test-country-local-crypto.ts
npx tsx scripts/test-web3-expansion-feeds.ts
npx tsx scripts/test-hiring-links-548-recurring.ts
FAH_FAST_PREBUILD=1 npm run build
```

The build includes prebuild gates, the Next.js production build, standalone catalog/asset checks, prerender-budget checks, and feed-compression checks. Work was performed in the country-expansion worktree without committing, pushing, or deploying.

## Employer outcomes

“—” means that platform account was not verified from the researched official sources; no handle is guessed.

| Employer / page | Website | About | Official asset | LinkedIn | X / Twitter | Crunchbase | Current jobs |
|---|---|---|---|---|---|---|---:|
| [Coinmotion](https://hashtagweb3.com/coinmotion) | [root](https://coinmotion.com/) | Verified | [cached](/logo/companies/coinmotion.png) | [verified](https://www.linkedin.com/company/coinmotion/) | — | — | 0 |
| [PDAX](https://hashtagweb3.com/pdax) | [root](https://pdax.ph/) | Verified | [cached](/logo/companies/pdax.png) | [verified](https://www.linkedin.com/company/pdaxph) | [verified](https://x.com/pdaxph) | — | 0 |
| [Foxbit](https://hashtagweb3.com/foxbit) | [root](https://foxbit.com.br/) | Verified | [cached](/logo/companies/foxbit.png) | [verified](https://www.linkedin.com/company/foxbit/) | [verified](https://x.com/foxbit) | — | 0 |
| [Finoa](https://hashtagweb3.com/finoa) | [root](https://www.finoa.io/) | Verified | [cached](/logo/companies/finoa.png) | [verified](https://www.linkedin.com/company/finoa-io/) | [verified](https://x.com/Finoa_io) | — | 0 |
| [Taurus](https://hashtagweb3.com/taurus) | [root](https://www.taurushq.com/) | Verified | [cached](/logo/companies/taurus.png) | [verified](https://linkedin.com/company/taurus-sa) | [verified](https://x.com/taurus_hq) | — | 0 |
| [XREX](https://hashtagweb3.com/xrex) | [root](https://xrex.io/) | Verified | [cached](/logo/companies/xrex.png) | [verified](https://www.linkedin.com/company/xrexinc/) | [verified](https://x.com/xrexinc) | — | 0 |
| [Finst](https://hashtagweb3.com/finst) | [root](https://finst.com/) | Verified | [cached](/logo/companies/finst.png) | [verified](https://www.linkedin.com/company/finst-official) | [verified](https://twitter.com/finst_official) | — | 0 |
| [Breet](https://hashtagweb3.com/breet) | [root](https://breet.io/) | Verified | [cached](/logo/companies/breet.png) | [verified](https://www.linkedin.com/company/inbreetic) | [verified](https://x.com/breetapp) | — | 0 |
| [Bit2Me](https://hashtagweb3.com/bit2me) | [root](https://bit2me.com/) | Verified | [cached](/logo/companies/bit2me.png) | [verified](https://linkedin.com/company/bit2me) | [verified](https://x.com/Bit2Me) | — | 1 |
| [HoneyCoin](https://hashtagweb3.com/honeycoin) | [root](https://honeycoin.app/) | Verified | [cached](/logo/companies/honeycoin.png) | [verified](https://linkedin.com/company/honeycoin) | [verified](https://twitter.com/honeycoinapp) | — | 0 |
| [Dunamu](https://hashtagweb3.com/dunamu) | [root](https://www.dunamu.com/) | Verified | [cached](/logo/companies/dunamu.png) | [verified](https://linkedin.com/company/dunamu) | — | — | 0 |
| [21bitcoin](https://hashtagweb3.com/21bitcoin) | [root](https://21bitcoin.app/) | Verified | [cached](/logo/companies/21bitcoin.png) | [verified](https://www.linkedin.com/company/21bitcoin/) | [verified](https://x.com/21bitcoinApp) | — | 0 |
| [Aquanow](https://hashtagweb3.com/aquanow) | [root](https://www.aquanow.com/) | Verified | [cached](/logo/companies/aquanow.png) | [verified](https://www.linkedin.com/company/aquanow/) | [verified](https://x.com/aquanow) | — | 0 |
| [BISON](https://hashtagweb3.com/bison) | [root](https://bisonapp.com/) | Verified | [cached](/logo/companies/bison.png) | — | [verified](https://x.com/bisonapp) | — | 0 |
| [bitbank](https://hashtagweb3.com/bitbank) | [root](https://bitbank.cc/) | Verified | [cached](/logo/companies/bitbank.png) | — | [verified](https://twitter.com/bitbank_inc/) | — | 1 |
| [Bitcoin Suisse](https://hashtagweb3.com/bitcoin-suisse) | [root](https://bitcoinsuisse.com/) | Verified | [cached](/logo/companies/bitcoin-suisse.png) | [verified](https://www.linkedin.com/company/bitcoinsuissegroup) | [verified](https://x.com/BitcoinSuisse_) | — | 0 |
| [Bitmama](https://hashtagweb3.com/bitmama) | [root](https://bitmama.io/) | Verified | [cached](/logo/companies/bitmama.png) | — | [verified](https://twitter.com/bitmamaexchange) | — | 0 |
| [Bitnovo](https://hashtagweb3.com/bitnovo) | [root](https://www.bitnovo.com/) | Verified | [cached](/logo/companies/bitnovo.png) | [verified](https://www.linkedin.com/company/bitnovo/) | [verified](https://twitter.com/bitnovo) | — | 0 |
| [Cashlink](https://hashtagweb3.com/cashlink) | [root](https://cashlink.de/) | Verified | [cached](/logo/companies/cashlink.png) | [verified](https://de.linkedin.com/company/cashlink) | — | — | 0 |
| [Change](https://hashtagweb3.com/change) | [root](https://www.changeinvest.com/) | Verified | [cached](/logo/companies/change.png) | [verified](https://www.linkedin.com/company/changeinvest/) | [verified](https://twitter.com/changefinance) | — | 0 |
| [CoinCash](https://hashtagweb3.com/coincash) | [root](https://coincash.eu/) | Verified | [cached](/logo/companies/coincash.png) | [verified](https://www.linkedin.com/company/coincash) | [verified](https://twitter.com/CoinCashEU) | — | 0 |
| [CoinCorner](https://hashtagweb3.com/coincorner) | [root](https://www.coincorner.com/) | Verified | [cached](/logo/companies/coincorner.png) | [verified](https://www.linkedin.com/company/coincorner) | [verified](https://x.com/CoinCorner) | — | 0 |
| [Coinext](https://hashtagweb3.com/coinext) | [root](https://coinext.com.br/) | Verified | [cached](/logo/companies/coinext.png) | [verified](https://www.linkedin.com/company/coinext/) | [verified](https://x.com/Coinext_oficial) | — | 0 |
| [Coinfinity](https://hashtagweb3.com/coinfinity) | [root](https://coinfinity.co/) | Verified | [cached](/logo/companies/coinfinity.png) | [verified](https://linkedin.com/company/coinfinity/) | [verified](https://x.com/coinfinity) | — | 0 |
| [Deblock](https://hashtagweb3.com/deblock) | [root](https://deblock.com/) | Verified | [cached](/logo/companies/deblock.png) | [verified](https://www.linkedin.com/company/deblock/) | [verified](https://twitter.com/DeblockApp) | — | 0 |
| [double jump.tokyo](https://hashtagweb3.com/double-jump-tokyo) | [root](https://www.doublejump.tokyo/) | Verified | [cached](/logo/companies/double-jump-tokyo.png) | [verified](https://www.linkedin.com/company/doublejump-tokyo) | [verified](https://x.com/doublejumptokyo) | — | 0 |
| [Flitpay](https://hashtagweb3.com/flitpay) | [root](https://www.flitpay.com/) | Verified | [cached](/logo/companies/flitpay.png) | — | [verified](https://twitter.com/flitpayofficial) | — | 0 |
| [FOMO Pay](https://hashtagweb3.com/fomo-pay) | [root](https://www.fomopay.com/) | Verified | [cached](/logo/companies/fomo-pay.png) | [verified](https://www.linkedin.com/company/fomo-pay) | [verified](https://twitter.com/FOMOPayOfficial) | — | 0 |
| [Fuze](https://hashtagweb3.com/fuze) | [root](https://fuze.finance/) | Verified | [cached](/logo/companies/fuze.png) | [verified](https://www.linkedin.com/company/fuzehq) | [verified](https://x.com/fuzefinance) | — | 0 |
| [Ginco](https://hashtagweb3.com/ginco) | [root](https://www.ginco.co.jp/) | Verified | [cached](/logo/companies/ginco.png) | — | [verified](https://x.com/ginco_inc) | — | 0 |
| [Hata](https://hashtagweb3.com/hata) | [root](https://hata.io/) | Verified | [cached](/logo/companies/hata.png) | [verified](https://www.linkedin.com/company/hataglobal/) | [verified](https://x.com/hataglobal/) | — | 0 |
| [KoinX](https://hashtagweb3.com/koinx) | [root](https://www.koinx.com/) | Verified | [cached](/logo/companies/koinx.png) | [verified](https://www.linkedin.com/company/getkoinx) | [verified](https://x.com/getkoinx) | — | 0 |
| [Lemon](https://hashtagweb3.com/lemon) | [root](https://lemon.me/) | Verified | [cached](/logo/companies/lemon.png) | [verified](https://www.linkedin.com/company/lemonlat) | [verified](https://twitter.com/lemonapp_ar) | — | 0 |
| [Liminal](https://hashtagweb3.com/liminal-custody) | [root](https://www.liminalcustody.com/) | Verified | [cached](/logo/companies/liminal-custody.png) | [verified](https://www.linkedin.com/company/liminalcustody/) | [verified](https://twitter.com/liminalcustody) | — | 0 |
| [MidChains](https://hashtagweb3.com/midchains) | [root](https://www.midchains.com/) | Verified | [cached](/logo/companies/midchains.png) | [verified](https://www.linkedin.com/company/midchains/) | [verified](https://x.com/MidChains_) | — | 0 |
| [Mt Pelerin](https://hashtagweb3.com/mt-pelerin) | [root](https://www.mtpelerin.com/) | Verified | [cached](/logo/companies/mt-pelerin.png) | [verified](https://www.linkedin.com/company/mt-pelerin/) | — | — | 0 |
| [NBX](https://hashtagweb3.com/nbx) | [root](https://nbx.com/) | Verified | [cached](/logo/companies/nbx.png) | — | [verified](https://twitter.com/nbxcom) | — | 0 |
| [Netcoins](https://hashtagweb3.com/netcoins) | [root](https://netcoins.com/) | Verified | [cached](/logo/companies/netcoins.png) | — | [verified](https://twitter.com/Netcoins) | — | 0 |
| [Paymium](https://hashtagweb3.com/paymium) | [root](https://www.paymium.com/) | Verified | [cached](/logo/companies/paymium.png) | [verified](https://www.linkedin.com/company/paymium/) | [verified](https://x.com/paymium_en) | — | 0 |
| [Relai](https://hashtagweb3.com/relai) | [root](https://relai.app/) | Verified | [cached](/logo/companies/relai.png) | [verified](https://www.linkedin.com/company/relai-app) | [verified](https://x.com/Relai_app) | — | 0 |
| [Safello](https://hashtagweb3.com/safello) | [root](https://safello.com/) | Verified | [cached](/logo/companies/safello.png) | — | [verified](https://twitter.com/SafelloAB) | — | 0 |
| [SBI VC Trade](https://hashtagweb3.com/sbi-vc-trade) | [root](https://www.sbivc.co.jp/) | Verified | [cached](/logo/companies/sbi-vc-trade.png) | — | [verified](https://twitter.com/sbivc_official) | — | 0 |
| [Tangany](https://hashtagweb3.com/tangany) | [root](https://tangany.com/) | Verified | [cached](/logo/companies/tangany.png) | [verified](https://www.linkedin.com/company/11444632) | [verified](https://twitter.com/tangany) | — | 0 |
| [Waltio](https://hashtagweb3.com/waltio) | [root](https://www.waltio.com/) | Verified | [cached](/logo/companies/waltio.png) | [verified](https://www.linkedin.com/company/waltio/) | [verified](https://twitter.com/Get_Waltio) | — | 0 |
| [Zumo](https://hashtagweb3.com/zumo) | [root](https://zumo.co.uk/) | Verified | [cached](/logo/companies/zumo.png) | [verified](https://www.linkedin.com/company/zumo-enterprise/) | [verified](https://twitter.com/zumopay) | — | 0 |
| [Swissquote](https://hashtagweb3.com/swissquote) | [root](https://www.swissquote.com/) | Verified | [cached](/logo/companies/swissquote.png) | [verified](https://www.linkedin.com/company/swissquote) | [verified](https://x.com/Swissquote) | — | 0 |
| [Ankr](https://hashtagweb3.com/ankr) | [root](https://www.ankr.com/) | Verified | [cached](/logo/companies/ankr.png) | — | [verified](https://twitter.com/ankr) | — | 0 |
| [Applied Blockchain](https://hashtagweb3.com/applied-blockchain) | [root](https://appliedblockchain.com/) | Verified | [cached](/logo/companies/applied-blockchain.png) | [verified](https://www.linkedin.com/company/applied-blockchain/) | [verified](https://x.com/appblockchain) | — | 0 |
| [Arcus](https://hashtagweb3.com/arcus) | [root](https://arcus.xyz/) | Verified | [cached](/logo/companies/arcus.png) | [verified](https://www.linkedin.com/company/arcus-xyz) | [verified](https://x.com/arcus_xyz) | — | 0 |
| [Argus Labs](https://hashtagweb3.com/argus-labs) | [root](https://argus.gg/) | Verified | [cached](/logo/companies/argus-labs.png) | [verified](https://www.linkedin.com/company/arguslabs/) | [verified](https://x.com/ArgusLabs_) | — | 0 |
| [Arrakis Finance](https://hashtagweb3.com/arrakis-finance) | [root](https://arrakis.finance/) | Verified | [cached](/logo/companies/arrakis-finance.png) | — | [verified](https://x.com/ArrakisFinance) | — | 0 |
| [Auros](https://hashtagweb3.com/auros) | [root](https://www.auros.global/) | Verified | [cached](/logo/companies/auros.png) | [verified](https://www.linkedin.com/company/aurosglobal) | [verified](https://x.com/Auros_global) | — | 0 |
| [Axiom](https://hashtagweb3.com/axiom) | [root](https://www.axiom.xyz/) | Verified | [cached](/logo/companies/axiom.png) | — | [verified](https://x.com/axiom_xyz) | — | 0 |
| [Bitaccess](https://hashtagweb3.com/bitaccess) | [root](https://bitaccess.ca/) | Verified | [cached](/logo/companies/bitaccess.png) | — | [verified](https://twitter.com/bitaccess) | — | 0 |
| [Bitonic](https://hashtagweb3.com/bitonic) | [root](https://bitonic.nl/) | Verified | [cached](/logo/companies/bitonic.png) | — | [verified](https://x.com/bitonic) | — | 0 |
| [Bluefin](https://hashtagweb3.com/bluefin) | [root](https://bluefin.io/) | Verified | [cached](/logo/companies/bluefin.png) | — | [verified](https://twitter.com/bluefinapp) | — | 0 |
| [BOB](https://hashtagweb3.com/bob) | [root](https://www.gobob.xyz/) | Verified | [cached](/logo/companies/bob.png) | — | [verified](https://twitter.com/build_on_bob) | — | 0 |
| [Boost](https://hashtagweb3.com/boost) | [root](https://www.boost.xyz/) | Verified | [cached](/logo/companies/boost.png) | — | [verified](https://twitter.com/boost_xyz) | — | 0 |
| [Bullish](https://hashtagweb3.com/bullish) | [root](https://www.bullish.com/) | Verified | [cached](/logo/companies/bullish.png) | [verified](https://linkedin.com/company/bebullish) | [verified](https://twitter.com/Bullish) | — | 8 |
| [Dialectic](https://hashtagweb3.com/dialectic) | [root](https://dialectic.com/) | Verified | [cached](/logo/companies/dialectic.png) | — | [verified](https://twitter.com/Dialectic_Group) | — | 0 |
| [Eco](https://hashtagweb3.com/eco-protocol) | [root](https://eco.com/) | Verified | [cached](/logo/companies/eco.png) | [verified](https://www.linkedin.com/company/ecoproto/) | [verified](https://x.com/eco) | — | 0 |
| [Hype](https://hashtagweb3.com/hype) | [root](https://www.hy.pe/) | Verified | [cached](/logo/companies/hype.png) | [verified](https://www.linkedin.com/company/hype-partners/) | [verified](https://x.com/hypepartners) | — | 0 |
| [Injective Labs](https://hashtagweb3.com/injective-labs) | [root](https://injectivelabs.org/) | Verified | [cached](/logo/companies/injective-labs.png) | [verified](https://www.linkedin.com/company/injectivelabs) | [verified](https://twitter.com/injectivelabs) | — | 1 |
| [Institute of Free Technology](https://hashtagweb3.com/institute-of-free-technology) | [root](https://free.technology/) | Verified | [cached](/logo/companies/institute-of-free-technology.png) | [verified](https://www.linkedin.com/company/institute-of-free-technologies/) | [verified](https://twitter.com/InstituteFT) | — | 0 |
| [IntellectEU](https://hashtagweb3.com/intellecteu) | [root](https://www.intellecteu.com/) | Verified | [cached](/logo/companies/intellecteu.png) | [verified](https://www.linkedin.com/company/intellecteu) | [verified](https://twitter.com/intellecteu) | — | 0 |
| [Kappa Lab](https://hashtagweb3.com/kappa-lab) | [root](https://kappalab.io/) | Verified | [cached](/logo/companies/kappa-lab.png) | [verified](https://www.linkedin.com/company/kappalab) | [verified](https://x.com/KappaLab_io) | — | 0 |
| [Legend](https://hashtagweb3.com/legend) | [root](https://legend.xyz/) | Verified | [cached](/logo/companies/legend.png) | — | [verified](https://x.com/legendapp) | — | 0 |
| [Lisk](https://hashtagweb3.com/lisk) | [root](https://lisk.com/) | Verified | [cached](/logo/companies/lisk.png) | [verified](https://www.linkedin.com/company/lisk) | [verified](https://x.com/Lisk) | — | 0 |
| [Makina](https://hashtagweb3.com/makina) | [root](https://makina.finance/) | Verified | [cached](/logo/companies/makina.png) | — | [verified](https://x.com/makinafi) | — | 0 |
| [N1](https://hashtagweb3.com/n1) | [root](https://www.n1.xyz/) | Verified | [cached](/logo/companies/n1.png) | — | [verified](https://x.com/N1Chain) | — | 0 |
| [Nimbus](https://hashtagweb3.com/nimbus) | [root](https://nimbus.team/) | Verified | [cached](/logo/companies/nimbus.png) | — | [verified](https://x.com/ethnimbus) | — | 0 |
| [Optimism Foundation](https://hashtagweb3.com/optimism-foundation) | [root](https://optimism.io/) | Verified | [cached](/logo/companies/optimism-foundation.png) | [verified](https://www.linkedin.com/company/optimism-foundation) | [verified](https://x.com/Optimism) | — | 0 |
| [QCP Capital](https://hashtagweb3.com/qcp-capital) | [root](https://www.qcpgroup.com/) | Verified | [cached](/logo/companies/qcp-capital.png) | [verified](https://www.linkedin.com/company/qcp-group/) | [verified](https://twitter.com/QCPgroup) | — | 0 |
| [Quantstamp](https://hashtagweb3.com/quantstamp) | [root](https://quantstamp.com/) | Verified | [cached](/logo/companies/quantstamp.png) | [verified](https://www.linkedin.com/company/quantstamp/) | [verified](https://x.com/Quantstamp) | — | 0 |
| [The Better Money Company](https://hashtagweb3.com/the-better-money-company) | [root](https://bettermoney.com/) | Verified | [cached](/logo/companies/the-better-money-company.png) | — | [verified](https://x.com/bettermoney_co) | — | 0 |
| [Trilitech](https://hashtagweb3.com/trilitech) | [root](https://www.trili.tech/) | Verified | [cached](/logo/companies/trilitech.png) | [verified](https://www.linkedin.com/company/trilitech) | [verified](https://twitter.com/trilitech) | — | 0 |
| [Usual](https://hashtagweb3.com/usual) | [root](https://usual.money/) | Verified | [cached](/logo/companies/usual.png) | [verified](https://www.linkedin.com/company/usualmoney/) | [verified](https://x.com/usualmoney) | — | 0 |
| [VeeFriends](https://hashtagweb3.com/veefriends) | [root](https://veefriends.com/) | Verified | [cached](/logo/companies/veefriends.png) | — | [verified](https://x.com/veefriends) | — | 0 |
| [Violet](https://hashtagweb3.com/violet) | [root](https://www.violet.co/) | Verified | [cached](/logo/companies/violet.png) | — | [verified](https://twitter.com/violetidentity) | — | 0 |
| [ZenLedger](https://hashtagweb3.com/zenledger) | [root](https://zenledger.io/) | Verified | [cached](/logo/companies/zenledger.png) | [verified](https://www.linkedin.com/company/zenledger-io/) | [verified](https://twitter.com/ZenLedgerIO) | — | 0 |
| [Zircuit](https://hashtagweb3.com/zircuit) | [root](https://www.zircuit.com/) | Verified | [cached](/logo/companies/zircuit.png) | — | [verified](https://twitter.com/zircuit) | — | 0 |
