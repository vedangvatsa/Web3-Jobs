# hashtagweb3

Official Ruby Gem for [Hashtag Web3](https://hashtagweb3.com) — Web3 jobs, crypto news, events, and technical glossary.

## Installation

```bash
gem install hashtagweb3
```

## Quickstart

```ruby
require 'hashtagweb3'

client = HashtagWeb3::Client.new
jobs = client.get_jobs(search: 'Solidity', limit: 10)
puts jobs
```
