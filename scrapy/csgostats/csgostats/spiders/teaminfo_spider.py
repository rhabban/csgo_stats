"""import scrapy
import json

class TeamInfoItem(scrapy.Item):
    teamname = scrapy.Field()
    country = scrapy.Field()
    logo = scrapy.Field()
    players = scrapy.Field()

class TeamInfoSpider(scrapy.Spider):
    name = "teaminfo"
    start_urls = []

    with open('teamname.json') as json_data:
        d = json.load(json_data)

        for item in d:
            start_urls.append(item['link'])

    def parse(self, response):
        item = TeamInfoItem()
        item['teamname'] = response.css('#firstHeading::text').extract_first()
        item['country'] = response.css('#mw-content-text > div.fo-nttax-infobox-wrapper > div.fo-nttax-infobox.wiki-bordercolor-light > div:nth-child(4) > div:nth-child(2) > a:nth-child(2)::text').extract_first()
        item['logo'] = response.css('#mw-content-text > div.fo-nttax-infobox-wrapper > div.fo-nttax-infobox.wiki-bordercolor-light > div:nth-child(2) > div > div > div > a > img::attr(src)').extract_first()

        item['players'] = []
        for player in response.css('#p-navigation > div > ul > li'):
            item['players'].append(player.css('a::text').extract())
        yield item

"""