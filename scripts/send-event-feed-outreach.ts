import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

interface Target {
  siteName: string;
  to: string;
  alreadySent?: boolean;
}

const FEED_URL = "https://hashtagweb3.com/events/feed.xml";
const EVENTS_PAGE = "https://hashtagweb3.com/events";

const TARGETS: Target[] = [
  // Batch 1 (already sent)
  { siteName: "dev.events", to: "hello@dev.events", alreadySent: true },
  { siteName: "ConferenceGrid", to: "data@conferencegrid.com", alreadySent: true },
  { siteName: "CoinNewsSpan", to: "events@coinnewsspan.com", alreadySent: true },
  // Batch 2 (already sent)
  { siteName: "COIN360", to: "contact@coin360.com", alreadySent: true },
  { siteName: "Crypto Coin Show", to: "events@cryptocoinshow.simplelogin.com", alreadySent: true },
  { siteName: "CoinGape", to: "events@coingape.com", alreadySent: true },
  { siteName: "Trade Brains", to: "events@tradebrains.in", alreadySent: true },
  { siteName: "Cryptolaxy", to: "contact@cryptolaxy.com", alreadySent: true },
  { siteName: "Coinpedia", to: "Partner@coinpedia.org", alreadySent: true },
  { siteName: "The Blockopedia", to: "hello@theblockopedia.com", alreadySent: true },
  { siteName: "10Times", to: "sales@10times.com", alreadySent: true },
  { siteName: "itez", to: "hello@itez.com", alreadySent: true },
  // Batch 3 — tech / developer
  { siteName: "Conference Alerts", to: "alerts@conferencealerts.com", alreadySent: true},
  { siteName: "Conference Alert", to: "info@conferencealert.com", alreadySent: true},
  { siteName: "Conference Monkey", to: "info@conferencemonkey.org", alreadySent: true},
  { siteName: "Devpost", to: "support@devpost.com", alreadySent: true},
  { siteName: "Sessionize", to: "support@sessionize.com", alreadySent: true},
  { siteName: "WikiCFP", to: "wikicfp@gmail.com", alreadySent: true},
  { siteName: "F6S", to: "support@f6s.com", alreadySent: true},
  { siteName: "TechUK", to: "events@techuk.org", alreadySent: true},
  { siteName: "EventBrowse", to: "contact@eventbrowse.com", alreadySent: true},
  { siteName: "MLH", to: "hi@mlh.io", alreadySent: true},
  // Batch 3 — B2B / expo / trade shows
  { siteName: "BizBash", to: "calendar@bizbash.com", alreadySent: true},
  { siteName: "FintechLabs", to: "chris@fintechlabs.com", alreadySent: true},
  { siteName: "AUMA", to: "info@auma.de", alreadySent: true},
  { siteName: "B2B Fairs", to: "info@b2bfairs.co.uk", alreadySent: true},
  { siteName: "TradeShowsWorld", to: "hello@tradeshowsworld.com", alreadySent: true},
  { siteName: "TheTradeShowCalendar", to: "info@thetradeshowcalendar.com", alreadySent: true},
  { siteName: "Exhibition News", to: "en@mashmedia.net", alreadySent: true},
  { siteName: "Conference News", to: "mbooth@mashmedia.net", alreadySent: true},
  { siteName: "Event Industry News", to: "kizzy@eventindustrynews.com", alreadySent: true},
  { siteName: "Exhibit City News", to: "newsdesk@exhibitcitynews.com", alreadySent: true},
  { siteName: "Trade Show Executive", to: "mryley@tradeshowexecutive.com", alreadySent: true},
  { siteName: "TSNN", to: "dtormohlen@tsnn.com", alreadySent: true},
  { siteName: "EXHIBITOR", to: "news@exhibitorgroup.com", alreadySent: true},
  // Batch 3 — academic / CFP
  { siteName: "Call4Paper", to: "support@manuscriptlink.com", alreadySent: true},
  { siteName: "World Conference Calendar", to: "info@worldconferencecalendar.com", alreadySent: true},
  { siteName: "ConfLists", to: "contact@conferencelists.org", alreadySent: true},
  { siteName: "Conference Inc", to: "hello@conferenceinc.net", alreadySent: true},
  { siteName: "AcademicEvents", to: "service@academicevents.org", alreadySent: true},
  { siteName: "Conference Flare", to: "info@conferenceflare.com", alreadySent: true},
  { siteName: "ConferenceSked", to: "support@conferencesked.com", alreadySent: true},
  { siteName: "cfp.wiki", to: "support@cfp.wiki", alreadySent: true},
  { siteName: "Academicsera", to: "info@academicsera.com", alreadySent: true},
  { siteName: "Where2Submit", to: "info@where2submit.com", alreadySent: true},
  { siteName: "Conffinder", to: "info@conffinder.com", alreadySent: true},
  { siteName: "Peeref", to: "support@peeref.com", alreadySent: true},
  { siteName: "Papers Invited", to: "support@papersinvited.com", alreadySent: true},
  { siteName: "Conference in Africa", to: "info@conferenceinafrica.com", alreadySent: true},
  { siteName: "Academic.net", to: "contact-info@academic.net", alreadySent: true},
  { siteName: "SciencePlus", to: "papers.scienceplus@gmail.com", alreadySent: true},
  { siteName: "KindCongress", to: "kindcongress@gmail.com", alreadySent: true},
  { siteName: "Conference Alerts India", to: "info@conferencealerts.in", alreadySent: true},
  { siteName: "Intl Conference Alerts", to: "support@internationalconferencealerts.com", alreadySent: true},
  // Batch 3 — finance / AI / data
  { siteName: "PayTech.Events", to: "events@paytech.events", alreadySent: true},
  { siteName: "FinTech Weekly", to: "news@fintechweekly.com", alreadySent: true},
  { siteName: "RegTech Association", to: "members@regtechglobal.org", alreadySent: true},
  { siteName: "Data Umbrella", to: "info@dataumbrella.org", alreadySent: true},
  { siteName: "FAEConf", to: "info@faeconf.com", alreadySent: true},
  { siteName: "Swiss FinTech Association", to: "communications@swissfinte.ch", alreadySent: true},
  { siteName: "AIPressRoom", to: "news@aipressroom.com", alreadySent: true},
  { siteName: "Crypto Events", to: "Info@cryptoevents.com", alreadySent: true},
  { siteName: "Fintech News Singapore", to: "partners@fintechnews.sg", alreadySent: true},
  { siteName: "FinTech Profile", to: "ewan@fintechprofile.com", alreadySent: true},
  { siteName: "Lime Street Guide", to: "info@limestreetguide.com", alreadySent: true},
  { siteName: "Alternative Investor Portal", to: "hello@alternativeinvestorportal.com", alreadySent: true},
  { siteName: "FinTech Scotland", to: "contact@fintechscotland.com", alreadySent: true},
  { siteName: "FinDev Gateway", to: "FinDevGateway@worldbank.org", alreadySent: true},
  { siteName: "Innovate Finance", to: "connect@innovatefinance.com", alreadySent: true},
  { siteName: "AIcrowd", to: "hello@aicrowd.com", alreadySent: true},
  // Batch 3 — startup / community / regional
  { siteName: "EventsBeta", to: "hello@eventsbeta.com", alreadySent: true},
  { siteName: "foundercal", to: "hello@lukasvonkunhardt.com", alreadySent: true},
  { siteName: "StartupValley", to: "contact@startupvalley.news", alreadySent: true},
  { siteName: "Sumwhere", to: "hello@sumwhere.app", alreadySent: true},
  { siteName: "Galviq", to: "sales@galviq.com", alreadySent: true},
  { siteName: "Explorio World", to: "hello@explorioworld.com", alreadySent: true},
  { siteName: "Venture Week", to: "info@venture-week.com", alreadySent: true},
  { siteName: "StartupNews.fyi", to: "office@startupnews.fyi", alreadySent: true},
  { siteName: "EventYo", to: "geteventyo@gmail.com", alreadySent: true},
  { siteName: "47Hz", to: "info@47hz.com", alreadySent: true},
  { siteName: "Fintech MEA", to: "info@fintechmea.com", alreadySent: true},
  { siteName: "Startup Map Africa", to: "olivia@startupmapafrica.com", alreadySent: true},
  { siteName: "TechEventsHub", to: "contacto@techeventshub.com", alreadySent: true},
  { siteName: "events.lat", to: "hello@events.lat", alreadySent: true},
  { siteName: "Startup Wisconsin", to: "hello@startupwi.org", alreadySent: true},
  { siteName: "FoundersBay", to: "support@foundersbay.com", alreadySent: true},
  { siteName: "Manchester Tech Events", to: "info@manchestertechevents.com", alreadySent: true},
  { siteName: "theDevArmy", to: "command@thedevarmy.com", alreadySent: true},
  { siteName: "Entrepreneurs Catalyst Hub", to: "info@entrepreneurscatalysthub.com", alreadySent: true},
  { siteName: "Africa2Trust", to: "info@africa2trust.com", alreadySent: true},
  { siteName: "MENA Startup Calendar", to: "belal.younes@wecancity.com", alreadySent: true},
  { siteName: "Coincu", to: "news@coincu.com", alreadySent: true},
  { siteName: "Varmeta", to: "contact@var-meta.com", alreadySent: true},
  { siteName: "MTLC", to: "contact@mtlc.co", alreadySent: true},
  // Batch 4 — health / medtech / pharma
  { siteName: "MedicalCalendar.org", to: "biomednews@aol.com", alreadySent: true},
  { siteName: "MedicalEvents.com", to: "support@medicalevents.com", alreadySent: true},
  { siteName: "Longwoods Publishing", to: "conferences@longwoods.com", alreadySent: true},
  { siteName: "MedicaList.org", to: "support@medicalist.org", alreadySent: true},
  { siteName: "CMEGallery", to: "info@cmegallery.com", alreadySent: true},
  { siteName: "eMedEvents", to: "support@emedevents.com", alreadySent: true},
  { siteName: "BioIndustry Association", to: "events@bioindustry.org", alreadySent: true},
  { siteName: "European Biotech Week", to: "hello@biotechweek.org", alreadySent: true},
  { siteName: "Life Sciences Week UK", to: "info@lifesciencesweek.co.uk", alreadySent: true},
  { siteName: "HealthViews India", to: "info@healthviewsonline.com", alreadySent: true},
  { siteName: "BioSpectrum Asia", to: "communications@biospectrumasia.com", alreadySent: true},
  { siteName: "Pharma Focus Europe", to: "info@pharmafocuseurope.com", alreadySent: true},
  { siteName: "Pharmaceutical-Era", to: "Info@pharmaceutical-era.com", alreadySent: true},
  // Batch 4 — gaming / esports / entertainment
  { siteName: "GamesIndustry.biz", to: "contact@gamesindustry.biz", alreadySent: true},
  { siteName: "HLTV", to: "martin@hltv.org", alreadySent: true},
  { siteName: "VLR", to: "community@vlr.gg", alreadySent: true},
  { siteName: "Esportsguide", to: "contact@esportsguide.com", alreadySent: true},
  { siteName: "start.gg", to: "support@start.gg", alreadySent: true},
  { siteName: "ScoreGG", to: "kf@scoregg.com", alreadySent: true},
  { siteName: "GamingEvents.info", to: "info@gamingevents.info", alreadySent: true},
  { siteName: "Chortle", to: "feedback@chortle.co.uk", alreadySent: true},
  { siteName: "Artsy", to: "support@artsy.net", alreadySent: true},
  { siteName: "ArtRabbit", to: "support@artrabbit.com", alreadySent: true},
  { siteName: "OffWestEnd", to: "geoffrey@offwestend.com", alreadySent: true},
  { siteName: "The Stage", to: "letters@thestage.co.uk", alreadySent: true},
  { siteName: "Short of the Week", to: "help@shortoftheweek.com", alreadySent: true},
  { siteName: "ShortFilmDepot", to: "help@shortfilmdepot.com", alreadySent: true},
  // Batch 4 — marketing / media / design
  { siteName: "NeonMoire", to: "submit@neonmoire.com", alreadySent: true},
  { siteName: "AIA New York", to: "info@aiany.org", alreadySent: true},
  { siteName: "KUTX", to: "music@kutx.org", alreadySent: true},
  { siteName: "ArtsATL", to: "katie@artsatl.org", alreadySent: true},
  { siteName: "The List", to: "art@list.co.uk", alreadySent: true},
  // Batch 4 — energy / climate / sustainability
  { siteName: "Global Renewable Events", to: "admin@globalrenewableevents.com", alreadySent: true},
  { siteName: "Power Info Today", to: "james@powerinfotoday.com", alreadySent: true},
  { siteName: "Energypedia", to: "info@energypedia.info", alreadySent: true},
  { siteName: "NC Sustainable Energy", to: "info@energync.org", alreadySent: true},
  { siteName: "AASHE", to: "bulletin@aashe.org", alreadySent: true},
  { siteName: "Sustainable Lehigh Valley", to: "calendar@sustainlv.org", alreadySent: true},
  // Batch 4 — misc niche verticals
  { siteName: "The Supply Chainer", to: "editor@thesupplychainer.com", alreadySent: true},
  { siteName: "Logistics Business", to: "info@logisticsbusiness.com", alreadySent: true},
  { siteName: "Proptech Events", to: "contact@proptechevents.com", alreadySent: true},
  { siteName: "DHRMap", to: "hi@dhrmap.com", alreadySent: true},
  { siteName: "RetailNews Asia", to: "editorial@retailnews.asia", alreadySent: true},
  { siteName: "eCommerce Tech", to: "info@ecommercetech.io", alreadySent: true},
  { siteName: "Aviation Week", to: "aero.calendar@aviationweek.com", alreadySent: true},
  { siteName: "Defence Buyer", to: "info@defencebuyer.com", alreadySent: true},
  { siteName: "LINGUIST List", to: "callconf@linguistlist.org", alreadySent: true},
  { siteName: "No-Till Farmer", to: "talk-ntf@lesspub.com", alreadySent: true},
  { siteName: "Farm Equipment", to: "talk-fe@lesspub.com", alreadySent: true},
  { siteName: "Farm Collector Show Directory", to: "info@farmcollectorshowdirectory.com", alreadySent: true},
  { siteName: "NDIS Events Australia", to: "info@ndiseventsaustralia.com", alreadySent: true},
  { siteName: "Cyber Events APAC", to: "contact@cybereventsapac.com", alreadySent: true},
  { siteName: "ASIL", to: "communications@asil.org", alreadySent: true},
  // Batch 4 — NGO / regional / institutions
  { siteName: "Texas Public Radio", to: "elisa@tpr.org", alreadySent: true},
  { siteName: "NHPR", to: "zmitchell@nhpr.org", alreadySent: true},
  { siteName: "KNKX", to: "bgoldstein@knkx.org", alreadySent: true},
  { siteName: "KPBX Spokane Public Radio", to: "kpbx@kpbx.org", alreadySent: true},
  { siteName: "Maryland Tech Council", to: "info@mdtechcouncil.com", alreadySent: true},
  { siteName: "Nevada Arts Council", to: "infonvartscouncil@arts.nv.gov", alreadySent: true},
  { siteName: "Arts Council of Princeton", to: "info@artscouncilofprinceton.org", alreadySent: true},
  { siteName: "Arts Lancaster", to: "info@artslancaster.com", alreadySent: true},
  { siteName: "SF Chamber", to: "info@sfchamber.com", alreadySent: true},
  { siteName: "Dothan Chamber", to: "info@dothan.com", alreadySent: true},
  { siteName: "Rochester MN Chamber", to: "chamber@rochestermnchamber.com", alreadySent: true},
  { siteName: "Capital Black Chamber", to: "info@capitalblackchamber.org", alreadySent: true},
  { siteName: "Illinois Library Association", to: "ila@ila.org", alreadySent: true},
  // Batch 5 — health / pharma (from user list)
  { siteName: "Pharma Advancement", to: "sanvi@pharmaadvancement.com", alreadySent: true},
  { siteName: "World Pharma Today", to: "kathryn@worldpharmatoday.com", alreadySent: true},
  { siteName: "AHHA", to: "mail@ahha.org", alreadySent: true},
  // Batch 5 — gaming / entertainment
  { siteName: "Resident Advisor", to: "promotersupport@ra.co", alreadySent: true},
  { siteName: "DesignMyNight", to: "katie@designmynight.com", alreadySent: true},
  { siteName: "Secret London", to: "hello@secretldn.com", alreadySent: true},
  { siteName: "BroadwayWorld", to: "afreeman@broadwayworld.com", alreadySent: true},
  // Batch 5 — energy / climate
  { siteName: "Global Green Events", to: "connect@globalgreenevents.org", alreadySent: true},
  { siteName: "GWEC", to: "communications@gwec.net", alreadySent: true},
  { siteName: "Tethys PNNL", to: "tethys@pnnl.gov", alreadySent: true},
  { siteName: "Climate Fringe", to: "info@climatefringe.org", alreadySent: true},
  { siteName: "National Clean Energy Week", to: "info@nationalcleanenergyweek.org", alreadySent: true},
  // Batch 5 — misc niche
  { siteName: "Colorado Workforce Dev Council", to: "cwdc@state.co.us", alreadySent: true},
  { siteName: "California Black Lawyers", to: "contact@calblacklawyers.org", alreadySent: true},
  { siteName: "Telecom Reseller", to: "amyralls@telecomreseller.com", alreadySent: true},
  { siteName: "Optical Connections News", to: "marketing@opticalconnectionsnews.com", alreadySent: true},
  { siteName: "OBAE New Mexico", to: "broadband@connect.nm.gov", alreadySent: true},
  { siteName: "STLPR Community Calendar", to: "calendar@stlpr.org", alreadySent: true},
  // Batch 5 — NGO / regional / institutions
  { siteName: "Visit Marin", to: "gina@visitmarin.org", alreadySent: true},
  { siteName: "Rochester Business Journal", to: "premmell@bridgetowermedia.com", alreadySent: true},
  { siteName: "VisitBN", to: "info@visitbn.org", alreadySent: true},
  { siteName: "Arizona Public Media", to: "webmaster@azpm.org", alreadySent: true},
  { siteName: "Reston Community Center", to: "rccwebsite@fairfaxcounty.gov", alreadySent: true},
  // Batch 5 — marketing / media / design
  { siteName: "AffCalendars", to: "hello@affcalendars.com", alreadySent: true},
  { siteName: "Marketing Conferences", to: "rob@firmpromote.com", alreadySent: true},
  { siteName: "Dorted", to: "admin@dorted.com", alreadySent: true},
  { siteName: "The Stable", to: "advertising@thestable.com.au", alreadySent: true},
  { siteName: "PR Moment", to: "bensmith@prmoment.com", alreadySent: true},
  { siteName: "ODwyer PR", to: "john@odwyerpr.com", alreadySent: true},
  { siteName: "Brandingmag", to: "editorial@brandingmag.com", alreadySent: true},
  { siteName: "Creative Boom", to: "links@creativeboom.com", alreadySent: true},
  { siteName: "Print Magazine", to: "editor@printmag.com", alreadySent: true},
  { siteName: "Content Marketing Institute", to: "cmi_info@informa.com", alreadySent: true},
  { siteName: "Post Status", to: "support@poststatus.com", alreadySent: true},
  { siteName: "WARC", to: "enquiries@warc.com", alreadySent: true},
  { siteName: "WAN-IFRA", to: "prabhu.n@wan-ifra.org", alreadySent: true},
  // Batch 6 — education / government / nonprofit
  { siteName: "ISTE", to: "iste@iste.org", alreadySent: true},
  { siteName: "NTEN", to: "info@nten.org", alreadySent: true},
  { siteName: "American Library Association", to: "ala@ala.org", alreadySent: true},
  { siteName: "Candid", to: "info@candid.org", alreadySent: true},
  { siteName: "Council on Foundations", to: "info@cof.org", alreadySent: true},
  { siteName: "Brookings Institution", to: "events@brookings.edu", alreadySent: true},
  { siteName: "Chatham House", to: "contact@chathamhouse.org", alreadySent: true},
  { siteName: "Atlantic Council", to: "info@atlanticcouncil.org", alreadySent: true},
  { siteName: "AAC&U", to: "registration@aacu.org", alreadySent: true},
  { siteName: "EdTechReview", to: "events@edtechreview.in", alreadySent: true},
  { siteName: "Devex", to: "events@devex.com", alreadySent: true},
  { siteName: "Idealist", to: "support@idealist.org", alreadySent: true},
  { siteName: "Urban Institute", to: "events@urban.org", alreadySent: true},
  { siteName: "Wilson Center", to: "wwics@wilsoncenter.org", alreadySent: true},
  { siteName: "CSIS", to: "externalrelations@csis.org", alreadySent: true},
  { siteName: "Apolitical", to: "hello@apolitical.co", alreadySent: true},
  { siteName: "Alliance Magazine", to: "alliance@alliancemagazine.org", alreadySent: true},
  // Batch 6 — food / travel / sports / music / film / fashion
  { siteName: "Sports Business Journal", to: "calendar@sportsbusinessjournal.com", alreadySent: true},
  { siteName: "FashionUnited", to: "media@fashionunited.com", alreadySent: true},
  { siteName: "FilmFreeway", to: "support@filmfreeway.com", alreadySent: true},
  { siteName: "Music Ally", to: "mail@musically.com", alreadySent: true},
  { siteName: "Pollstar", to: "tour_dates@pollstar.com", alreadySent: true},
  { siteName: "Breaking Travel News", to: "editor@breakingtravelnews.com", alreadySent: true},
  { siteName: "Hospitality Net", to: "info@hospitalitynet.org", alreadySent: true},
  { siteName: "iSportConnect", to: "info@isportconnect.com", alreadySent: true},
  { siteName: "CFDA", to: "info@cfda.com", alreadySent: true},
  { siteName: "Food Tank", to: "danielle@foodtank.com", alreadySent: true},
  { siteName: "Travel Daily News", to: "press@traveldailynews.com", alreadySent: true},
  { siteName: "Festhome", to: "help@festhome.com", alreadySent: true},
  { siteName: "SportsTravel Magazine", to: "info@mail.northstarmeetingsgroup.com", alreadySent: true},
  { siteName: "Hozpitality Plus", to: "email@hozpitalityplus.com", alreadySent: true},
  { siteName: "Boutique Hotel News", to: "katie@internationalhospitality.media", alreadySent: true},
  { siteName: "Specialty Food Association", to: "press@specialtyfood.com", alreadySent: true},
  // Batch 6 — legal / real estate / auto / manufacturing / insurance
  { siteName: "Legal Geek", to: "hello@legalgeek.co", alreadySent: true},
  { siteName: "LegalTech Events", to: "events@legal.io", alreadySent: true},
  { siteName: "Legal Futures", to: "contact@legalfutures.co.uk", alreadySent: true},
  { siteName: "ELTA", to: "info@elta.org", alreadySent: true},
  { siteName: "Property Week", to: "sales@propertyweek.com", alreadySent: true},
  { siteName: "Automotive IQ", to: "enquire@automotive-iq.com", alreadySent: true},
  { siteName: "Charged EVs", to: "info@ChargedEVs.com", alreadySent: true},
  { siteName: "The Manufacturer", to: "events_TM@nineteengroup.com", alreadySent: true},
  { siteName: "IndustryWeek", to: "customerservice@industryweek.com", alreadySent: true},
  { siteName: "The Architect's Newspaper", to: "info@archpaper.com", alreadySent: true},
  { siteName: "CIPD Events", to: "cipdevents.tickets@wonderly.agency", alreadySent: true},
  { siteName: "LMForums", to: "info@lmforums.com", alreadySent: true},
  { siteName: "IUMI", to: "info@iumi.com", alreadySent: true},
  { siteName: "Asia Insurance Review", to: "conference@asiainsurancereview.com", alreadySent: true},
  { siteName: "Qorus", to: "events@qorusglobal.com", alreadySent: true},
  { siteName: "InsTech", to: "hello@instech.co", alreadySent: true},
  // Batch 6 — cybersecurity / cloud / data / robotics / quantum / open source
  { siteName: "CAE Community", to: "info@caecommunity.org", alreadySent: true},
  { siteName: "Help Net Security", to: "press@helpnetsecurity.com", alreadySent: true},
  { siteName: "Techstrong Events", to: "sales@techstronggroup.com", alreadySent: true},
  { siteName: "CNCF", to: "info@cncf.io", alreadySent: true},
  { siteName: "Swiss Data Science Center", to: "info@sdsc.ch", alreadySent: true},
  { siteName: "U of T Data Sciences Institute", to: "info.dsi@utoronto.ca", alreadySent: true},
  { siteName: "IIoT World", to: "info@IIoT-World.com", alreadySent: true},
  { siteName: "National Robotics Week", to: "roboweek@massrobotics.org", alreadySent: true},
  { siteName: "MassRobotics", to: "info@massrobotics.org", alreadySent: true},
  { siteName: "Quantum Computing Report", to: "info@quantumcomputingreport.com", alreadySent: true},
  { siteName: "Inside Quantum Technology", to: "info@insidequantumtechnology.com", alreadySent: true},
  { siteName: "FOSS United", to: "foundation@fossunited.org", alreadySent: true},
  { siteName: "ICFOSS", to: "info@icfoss.in", alreadySent: true},
  { siteName: "Hackathon Hub", to: "support@hackathon-hub.de", alreadySent: true},
  { siteName: "Maker Faire", to: "makers@make.co", alreadySent: true},
  // Batch 6 — general discovery / city guides
  { siteName: "Londonist", to: "hello@londonist.com", alreadySent: true},
  { siteName: "Funcheap", to: "johnny@funcheap.com", alreadySent: true},
  { siteName: "Skiddle", to: "custcare@skiddle.com", alreadySent: true},
  { siteName: "AllEvents", to: "support@allevents.in", alreadySent: true},
  { siteName: "Do512", to: "Do512@do512.com", alreadySent: true},
  { siteName: "EverOut", to: "hello@everout.com", alreadySent: true},
  { siteName: "Broke-Ass Stuart", to: "vanessa@brokeassstuart.com", alreadySent: true},
  { siteName: "Oh My Rockness", to: "shows@ohmyrockness.com", alreadySent: true},
  { siteName: "Daily Info", to: "info@dailyinfo.co.uk", alreadySent: true},
  { siteName: "We Like LA", to: "tips@welikela.com", alreadySent: true},
  { siteName: "Ents24", to: "events@ents24.com", alreadySent: true},
  { siteName: "LA Parent", to: "Calendar@LAParent.com", alreadySent: true},
  { siteName: "The Stranger", to: "calendar@thestranger.com", alreadySent: true},
  { siteName: "Chicago Reader", to: "musiclistings@chicagoreader.com", alreadySent: true},
  { siteName: "Bandsintown", to: "support@bandsintown.com", alreadySent: true},
  // Batch 7 — universities / entrepreneurship (public submission + feeds)
  { siteName: "Cornell Entrepreneurship", to: "eship@cornell.edu", alreadySent: true},
  { siteName: "U of T Entrepreneurship", to: "entrepreneurs@utoronto.ca", alreadySent: true},
  { siteName: "Columbia Entrepreneurship", to: "entrepreneurship@columbia.edu", alreadySent: true},
  { siteName: "Harvard Catalyst", to: "communications@catalyst.harvard.edu", alreadySent: true},
  { siteName: "ASU Entrepreneurship", to: "entrepreneurship@asu.edu", alreadySent: true},
  { siteName: "Imperial College London", to: "events@imperial.ac.uk", alreadySent: true},
  { siteName: "MIT Events Calendar", to: "calendar@mit.edu", alreadySent: true},
  { siteName: "Einstein Med Calendar", to: "caleditor@einsteinmed.edu", alreadySent: true},
  { siteName: "Texas Medical Center", to: "info@tmc.edu", alreadySent: true},
  { siteName: "Yale Ventures", to: "yaleventures@yale.edu", alreadySent: true},
  { siteName: "CHOP Research", to: "researchcomm@chop.edu", alreadySent: true},
  { siteName: "Georgia Tech Calendar", to: "campus-calendar@gatech.edu", alreadySent: true},
  { siteName: "UW CREATE", to: "create-contact@uw.edu", alreadySent: true},
  // Batch 7 — city / civic calendars (public submission + iCal/RSS)
  { siteName: "Riverside CA Calendar", to: "communitycalendar@riversideca.gov", alreadySent: true},
  { siteName: "Prince Edward County", to: "info@pecounty.on.ca", alreadySent: true},
  { siteName: "Visit Lancaster City", to: "info@cityoflancasterpa.gov", alreadySent: true},
  { siteName: "City of St Louis", to: "CDA@stlouis-mo.gov", alreadySent: true},
  { siteName: "San Diego Special Events", to: "SpecialEvents@sandiego.gov", alreadySent: true},
  { siteName: "Visit Seattle", to: "info@bedynamic.com", alreadySent: true},
  { siteName: "City of Melbourne", to: "marketing@melbourne.vic.gov.au", alreadySent: true},
  { siteName: "Manhattan BP", to: "info@manhattanbp.nyc.gov", alreadySent: true},
  { siteName: "Destination Toronto", to: "calendar@destinationtoronto.com", alreadySent: true},
  { siteName: "Winchester Council", to: "events@winchester.gov.uk", alreadySent: true},
  { siteName: "Dundee Council", to: "events@dundeecity.gov.uk", alreadySent: true},
  { siteName: "Haringey Council", to: "content@haringey.gov.uk", alreadySent: true},
  { siteName: "Choose Chicago", to: "marketingsupport@choosechicago.com", alreadySent: true},
  // Batch 7 — open community calendars (FOSS / security / rationalist)
  { siteName: "foss.events", to: "contact@foss.events", alreadySent: true},
  { siteName: "OWASP", to: "support@owasp.org", alreadySent: true},
  { siteName: "Security BSides", to: "info@bsides.org", alreadySent: true},
  { siteName: "EMF Camp", to: "contact@emfcamp.org", alreadySent: true},
  { siteName: "HackerNest", to: "sponsor@hackernest.com", alreadySent: true},
  { siteName: "LessWrong", to: "team@lesswrong.com", alreadySent: true},
  { siteName: "EA Forum", to: "forum@centreforeffectivealtruism.org", alreadySent: true},
  { siteName: "Bay Area Skeptics", to: "admin@baskeptics.org", alreadySent: true},
  { siteName: "Skeptics in the Pub", to: "contact@sitp.online", alreadySent: true},
  { siteName: "CFI Western NY", to: "wny@centerforinquiry.net", alreadySent: true},
  { siteName: "SkeptiCamp NYC", to: "admin@skepticampnyc.org", alreadySent: true},
  { siteName: "Skeptics Society", to: "office@skeptic.com", alreadySent: true},
  { siteName: "Kiwiburn", to: "media@kiwiburn.com", alreadySent: true},
  { siteName: "CryptoSlate", to: "hello@cryptoslate.com", alreadySent: true},
  { siteName: "T-Hub", to: "contact@t-hub.co", alreadySent: true},
  // Batch 7 — feed directories / trade press with events intake
  { siteName: "Feedspot", to: "team@feedspot.com", alreadySent: true},
  { siteName: "Skift Meetings", to: "meetings@skift.com", alreadySent: true},
  { siteName: "EventsEye", to: "contact1@eventseye.com", alreadySent: true},
  { siteName: "eventplanner.net", to: "info@eventplanner.net", alreadySent: true},
  { siteName: "Podnews", to: "editor@podnews.net", alreadySent: true},
  { siteName: "Smart Meetings", to: "editor@smartmeetings.com", alreadySent: true}
];

function generateEmailText(siteName: string): string {
  return `Hi there,

I'm reaching out from Hashtag Web3 to offer you a recurring feed of upcoming Web3 events, free to ingest on ${siteName}.

We maintain one of the largest Web3 event calendars in the space. Our events feed is a standard RSS 2.0 document with 460 upcoming conferences, meetups, hackathons, and workshops, refreshed every hour:

  Feed: ${FEED_URL}
  Browse: ${EVENTS_PAGE}

Each <item> includes the event name, a link to the full event page, publish date, location, description, and a media image, so it can be added to your listings automatically and kept in sync as we add events.

Is your team open to ingesting this feed into ${siteName}? Happy to adjust the format (JSON, JSON-LD, iCal) if RSS isn't ideal, and to help with any schema you expect on your end.

Warm regards,

Alex
Partnerships Lead | Hashtag Web3
Website: https://hashtagweb3.com
Feed: ${FEED_URL}
`;
}

function generateEmailHtml(siteName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, \x27Segoe UI\x27, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi there,</p>
  <p>I’m reaching out from <strong>Hashtag Web3</strong> to offer you a recurring feed of upcoming Web3 events, free to ingest on <strong>${siteName}</strong>.</p>
  <p>We maintain one of the largest Web3 event calendars in the space. Our events feed is a standard RSS 2.0 document with <strong>460 upcoming conferences, meetups, hackathons, and workshops</strong>, refreshed every hour:</p>
  <ul style="padding-left: 20px; margin: 0 0 16px 0;">
    <li><strong>Feed:</strong> <a href="${FEED_URL}" style="color: #2563eb;">${FEED_URL}</a></li>
    <li><strong>Browse:</strong> <a href="${EVENTS_PAGE}" style="color: #2563eb;">${EVENTS_PAGE}</a></li>
  </ul>
  <p>Each <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 4px;">&lt;item&gt;</code> includes the event name, a link to the full event page, publish date, location, description, and a media image, so it can be added to your listings automatically and kept in sync as we add events.</p>
  <p>Is your team open to ingesting this feed into <strong>${siteName}</strong>? Happy to adjust the format (JSON, JSON-LD, iCal) if RSS isn’t ideal, and to help with any schema you expect on your end.</p>

  <p style="margin-top: 24px;">Warm regards,</p>
  <p style="margin: 0;"><strong>Alex</strong><br>
  Partnerships Lead | Hashtag Web3<br>
  Website: <a href="https://hashtagweb3.com" style="color: #2563eb;">hashtagweb3.com</a><br>
  Feed: <a href="${FEED_URL}" style="color: #2563eb;">${FEED_URL}</a></p>
</body>
</html>`;
}

async function run() {
  const dryRun = process.argv.includes("--dry-run");
  const newOnly = process.argv.includes("--new-only");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY in .env.local");
    process.exit(1);
  }

  const targets = newOnly ? TARGETS.filter(t => !t.alreadySent) : TARGETS;
  const resend = new Resend(apiKey);
  console.log(dryRun ? "DRY RUN (no emails will be sent)" : "");
  console.log(`${newOnly ? "NEW-ONLY" : "All"}: preparing ${targets.length} outreach emails...\n`);

  const results: any[] = [];

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];

    if (dryRun) {
      console.log(`[${i + 1}/${TARGETS.length}] Would send to ${t.siteName} (${t.to})`);
      console.log(`  Subject: Web3 events feed for ${t.siteName}`);
      console.log("  ----- email preview -----");
      console.log(generateEmailText(t.siteName));
      console.log("  ------------------------\n");
      continue;
    }

    console.log(`[${i + 1}/${TARGETS.length}] Sending to ${t.siteName} (${t.to})...`);

    try {
      const resp = await resend.emails.send({
        from: "Alex from Hashtag Web3 <alex@hashtagweb3.com>",
        to: [t.to],
        replyTo: "alex@hashtagweb3.com",
        subject: `Web3 events feed for ${t.siteName}`,
        text: generateEmailText(t.siteName),
        html: generateEmailHtml(t.siteName)
      });

      if (resp.error) {
        console.error(`  ❌ Error for ${t.siteName}:`, resp.error);
        results.push({ site: t.siteName, to: t.to, success: false, error: resp.error });
      } else {
        console.log(`  ✅ Sent successfully! ID: ${resp.data?.id}`);
        results.push({ site: t.siteName, to: t.to, success: true, id: resp.data?.id });
      }
    } catch (err: any) {
      console.error(`  ❌ Exception for ${t.siteName}:`, err.message);
      results.push({ site: t.siteName, to: t.to, success: false, error: err.message });
    }
  }

  if (dryRun) {
    console.log("DRY RUN complete. No emails were sent.");
    return;
  }

  console.log("\n========================================");
  console.log("Dispatch Summary:");
  const successful = results.filter(r => r.success).length;
  console.log(`Successfully sent: ${successful}/${targets.length}`);
  console.log("========================================");
}

run();