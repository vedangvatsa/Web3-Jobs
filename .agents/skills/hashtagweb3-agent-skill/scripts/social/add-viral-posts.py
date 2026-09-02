import json

file_path = "scripts/social/content-schedule.json"
with open(file_path, "r") as f:
    schedule = json.load(f)

new_posts = [
    {
        "id": "post_meme_viral_slerf",
        "imageUrl": "https://iili.io/BZt2gZN.jpg",
        "linkedin": {
            "text": "The 2024 crypto market in a nutshell:\n\nDev accidentally burns $10M in liquidity.\nToken hits $450M market cap because of 'scarcity.'\n\nMeanwhile, you are debugging a smart contract for an enterprise protocol with real revenue.\n\nStop pretending it makes sense. Just build where the actual talent is going.\n\nFind your next Web3 role at hashtagweb3.com"
        },
        "twitter": {
            "text": "Dev accidentally burns $10M in liquidity. Token hits $450M market cap.\n\nMeanwhile, you are debugging a smart contract for an enterprise protocol.\n\nStop pretending it makes sense. Just build where the actual talent is going.\n\nJobs: hashtagweb3.com"
        },
        "instagram": {
            "text": "Dev burns $10M in liquidity. Token hits $450M market cap.\n\nMeanwhile, you are debugging an enterprise smart contract.\n\nStop pretending it makes sense. Just build where the talent is going.\n\nJobs: hashtagweb3.com\n\n#web3 #crypto #developer #programming"
        }
    },
    {
        "id": "post_meme_viral_12yo",
        "imageUrl": "https://iili.io/BZt2Las.jpg",
        "linkedin": {
            "text": "Last year, a 12-year-old launched a token on a livestream, rug-pulled it for $30k, and flipped off the camera.\n\nWeb2 reaction: 'Crypto is dead.'\nWeb3 reaction: 'What a legend, let us pump it to $84M to teach him a lesson.'\n\nIf you can survive this industry's culture, you can build anywhere.\n\nThe real builders are quietly creating the future of finance. Join them: hashtagweb3.com"
        },
        "twitter": {
            "text": "12-year-old rugs a token for $30k.\nWeb3 reaction: 'Let's pump it to $84M to teach him a lesson.'\n\nIf you can survive this culture, you can build anywhere.\n\nThe real builders are quietly creating the future. Join them: hashtagweb3.com"
        },
        "instagram": {
            "text": "12-year-old rugs a token for $30k.\nWeb3 reaction: 'Let's pump it to $84M to teach him a lesson.'\n\nIf you can survive this culture, you can build anywhere.\n\nJoin the real builders: hashtagweb3.com\n\n#crypto #web3 #blockchain #developer"
        }
    },
    {
        "id": "post_meme_viral_chill_guy",
        "imageUrl": "https://iili.io/BZt338b.jpg",
        "linkedin": {
            "text": "The two types of Web3 developers:\n\n1. 'I need to optimize this gas usage by 0.0001 Gwei or the protocol will fail.'\n2. Just a Chill Guy deploying a fork of Uniswap V2 that accidentally does $50M in volume.\n\nBoth are highly employable in 2026.\n\nWhether you are an optimizer or a chill guy, we have 600+ roles waiting for you.\n\nApply today: hashtagweb3.com"
        },
        "twitter": {
            "text": "Two types of Web3 devs:\n\n1. Optimizing gas by 0.0001 Gwei.\n2. Just a Chill Guy deploying a Uni V2 fork that does $50M in volume.\n\nBoth are highly employable in 2026.\n\nJobs: hashtagweb3.com"
        },
        "instagram": {
            "text": "Two types of Web3 devs:\n1. Optimizing gas by 0.0001 Gwei.\n2. Just a Chill Guy deploying a Uni V2 fork.\n\nBoth are highly employable.\n\nJobs: hashtagweb3.com\n\n#chillguy #web3 #developer #programming #crypto"
        }
    },
    {
        "id": "post_meme_viral_ai_agent",
        "imageUrl": "https://iili.io/BZt38le.jpg",
        "linkedin": {
            "text": "Interviewer: Where do you see yourself in 5 years?\nMe: Hopefully retired, because an AI agent I deployed on Solana is trading memecoins and paying my mortgage in stablecoins.\n\nThe intersection of AI and Crypto is the fastest-growing sector right now. Do not fade it.\n\nFind roles building the agentic economy: hashtagweb3.com"
        },
        "twitter": {
            "text": "Interviewer: Where do you see yourself in 5 years?\nMe: Retired, because an AI agent I deployed on Solana is paying my mortgage in stablecoins.\n\nDo not fade the AI x Crypto intersection.\n\nJobs: hashtagweb3.com"
        },
        "instagram": {
            "text": "Interviewer: Where do you see yourself in 5 years?\nMe: Retired, because an AI agent I deployed on Solana is paying my mortgage.\n\nDo not fade AI x Crypto.\n\nJobs: hashtagweb3.com\n\n#ai #crypto #web3 #developer #solana"
        }
    }
]

schedule.extend(new_posts)
with open(file_path, "w") as f:
    json.dump(schedule, f, indent=2)
print(f"Added {len(new_posts)} viral posts to content-schedule.json")
