#!/usr/bin/env ruby

# A script to crawl one site. Only follows local links.

require 'bundler/setup'

require 'set'
require 'uri'
require 'json'
require 'open-uri'

require 'nokogiri'

$debug = true

def debug(s)
  if $debug
    STDERR.puts s
  end
end

class Link
  attr_reader :url, :text

  def initialize(url, text)
    @url, @text = url, text
  end

  def to_s
    "#{text} (#{url})"
  end

  def inspect
    "#<Link #{to_s}>"
  end

  def to_json(generator)
    {text: text, url: url}.to_json(generator)
  end
end


class Crawler
  attr_reader :base, :to_crawl, :seen

  def initialize(base)
    @base = URI(base)
    @to_crawl = [base]
    @results = {}
    @seen = Set.new
    @crawled = false
  end

  def results
    return @results if @crawled

    crawl
    @results
  end

  private

  def crawl
    @crawled = true

    until to_crawl.empty?
      url = to_crawl.shift

      if seen.include? url
        debug "> already seen #{url}"
        next
      end

      seen << url

      debug "> crawling #{url}"

      f = open(url)

      if f.content_type != 'text/html'
        f.close
        next
      end

      begin
        doc = Nokogiri::HTML(f)
      rescue OpenURI::HTTPError => e
        debug "! error crawling #{url}: #{e.message}"
      end

      f.close

      title = doc.css('title').first.text

      results[url] = {title: title, url: url, links: []}

      doc.css('a').each do |link|
        attr = link.attribute('href')

        next if attr.nil?

        u = attr.value
        normalized = normalize(u)

        results[url][:links] << {url: normalized || u, text: link.text}

        next if normalized.nil?

        if URI(normalized).host == base.host
          to_crawl << normalized
        end
      end
    end

  end

  def normalize(s)
    if s[0] == '#'
      return nil
    end

    if s[0] == '/'
      s = "#{base.scheme}://#{base.host}#{s}"
    end

    begin
      u = URI(s)
    rescue URI::InvalidURIError
      return nil
    end

    return nil unless u.is_a? URI::HTTP

    u.normalize!
    res = "#{u.scheme}://#{u.host}#{u.path}"
    res = res[0..-2] if res[-1] == '/'
    res
  end
end

if __FILE__ == $0
  if ARGV.size == 0
    STDERR.puts "usage: #{$0} site"
    exit 1
  end

  c = Crawler.new(ARGV[0])
  puts c.results.to_json
end
