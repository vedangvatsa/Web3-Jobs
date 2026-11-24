require 'net/http'
require 'json'
require 'uri'

module HashtagWeb3
  class Client
    def initialize(base_url = 'https://hashtagweb3.com')
      @origin = base_url.chomp('/')
    end

    def fetch_catalog(path)
      uri = URI("#{@origin}#{path}")
      req = Net::HTTP::Get.new(uri)
      req['Accept'] = 'application/json'
      req['User-Agent'] = 'HashtagWeb3-Ruby-SDK/2.0'
      res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') { |http| http.request(req) }
      JSON.parse(res.body)
    end

    def paginate(items, limit: 20, offset: 0)
      take = [[limit, 1].max, 200].min
      skip = [offset, 0].max
      items.drop(skip).take(take)
    end

    def get_jobs(search: nil, tag: nil, company: nil, limit: 20, offset: 0)
      raw = fetch_catalog('/data/jobs-runtime.json')
      all = raw.is_a?(Array) ? raw : (raw['jobs'] || [])
      filtered = all.select { |j| j['active'] != false }

      if search
        q = search.downcase
        filtered = filtered.select do |j|
          j['title'].to_s.downcase.include?(q) || j['company'].to_s.downcase.include?(q)
        end
      end
      if company
        c = company.downcase
        filtered = filtered.select { |j| j['company'].to_s.downcase.include?(c) }
      end
      if tag
        t = tag.downcase
        filtered = filtered.select { |j| Array(j['tags']).join(' ').downcase.include?(t) }
      end

      paginate(filtered, limit: limit, offset: offset)
    end

    def get_news(limit: 10)
      raw = fetch_catalog('/data/news-cache.json')
      items = raw.is_a?(Array) ? raw : (raw['news'] || raw['items'] || [])
      paginate(items, limit: limit, offset: 0)
    end
  end
end