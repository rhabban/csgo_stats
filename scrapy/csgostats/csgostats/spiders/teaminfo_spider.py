import scrapy
import json
import os

class TeamInfoItem(scrapy.Item):
    teamname = scrapy.Field()
    country = scrapy.Field()
    logo = scrapy.Field()
    totalEarning = scrapy.Field()

class TeamInfoSpider(scrapy.Spider):
    name = "teaminfo"
    start_urls = []

    if os.path.isfile('teamname.json') and os.stat("teamname.json").st_size != 0:
        with open('teamname.json') as json_data:
            d = json.load(json_data)

            for item in d:
                start_urls.append(item['link'])

    def parse(self, response):
        #check if game is global offensive
        if "Global Offensive" in str(response.css('#mw-content-text > div.fo-nttax-infobox-wrapper > div.fo-nttax-infobox.wiki-bordercolor-light > div > div > i > a::text').extract_first()):
            item = TeamInfoItem()
            item['teamname'] = response.css('#firstHeading::text').extract_first()
            item['country'] = response.css('#mw-content-text > div.fo-nttax-infobox-wrapper > div.fo-nttax-infobox.wiki-bordercolor-light > div:nth-child(4) > div:nth-child(2) > a:nth-child(2)::text').extract_first()
            item['logo'] = response.css('#mw-content-text > div.fo-nttax-infobox-wrapper > div.fo-nttax-infobox.wiki-bordercolor-light > div:nth-child(2) > div > div > div > a > img::attr(src)').extract_first()

            descNodes = response.css('#mw-content-text > div.fo-nttax-infobox-wrapper > div.fo-nttax-infobox.wiki-bordercolor-light > div')
            for descNode in descNodes:
                if "Total Earnings:" in str(descNode.css('div.infobox-cell-2.infobox-description::text').extract_first()):
                    item['totalEarning'] = descNode.css('div.infobox-cell-2.infobox-description + div.infobox-cell-2::text').extract_first()

            yield item
        