import scrapy

class MinorEventItem(scrapy.Item):
    name = scrapy.Field()
    date = scrapy.Field()
    prizepool = scrapy.Field()
    location = scrapy.Field()
    country = scrapy.Field()
    winner = scrapy.Field()
    runnerUp = scrapy.Field()

class MinorEventSpider(scrapy.Spider):
    name = "minorevents"
    start_urls = [
        'http://wiki.teamliquid.net/counterstrike/Minor_Tournaments',
    ]

    def parse(self, response):
        for event in response.css('.table-bordered tr'):
            #if not null, if CSGO event

            if event.css('td:nth-child(3) a::text').extract() and "Csgo" in str(event.css('td:nth-child(4) a::attr(href)').extract()):
                item = MinorEventItem()
                item['name'] = event.css('td:nth-child(3) a::text').extract()
                item['date'] = event.css('td:nth-child(1) span::text').extract()
                item['prizepool'] = event.css('td:nth-child(6)::text').extract()
                item['location'] = event.css('td:nth-child(8)::text').extract()
                item['country'] = event.css('td:nth-child(8) a::attr(title)').extract()
                item['winner'] = event.css('td:nth-child(9) span span:nth-child(2) a::text').extract()
                item['runnerUp'] = event.css('td:nth-child(10) span span:nth-child(2) a::text').extract()

                #if winner is determinated
                if item['winner']:
                    yield item
