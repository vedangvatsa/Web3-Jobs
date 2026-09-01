require 'net/http'
require 'json'
require 'uri'

module HashtagWeb3
  class Client
    def initialize(base_url = 'https://hashtagweb3.com/api/v1')
      @base_url = base_url.chomp('/')
    end

    def get_jobs(search: nil, tag: nil, company: nil, limit: 20, offset: 0)
      params = { limit: limit, offset: offset }
      params[:search] = search if search
      params[:tag] = tag if tag
      params[:company] = company if company

      uri = URI("#{@base_url}/jobs?#{URI.encode_www_form(params)}")
      response = Net::HTTP.get_response(uri)
      data = JSON.parse(response.body)
      data['jobs'] || data
    end

    def get_news(limit: 10)
      uri = URI("#{@base_url}/news?limit=#{limit}")
      response = Net::HTTP.get_response(uri)
      data = JSON.parse(response.body)
      data['news'] || data
    end
  end
end
