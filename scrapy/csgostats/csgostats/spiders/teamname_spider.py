import scrapy

class TeamNameItem(scrapy.Item):
    teamname = scrapy.Field()
    logo = scrapy.Field()
    link = scrapy.Field()

class TeamNameSpider(scrapy.Spider):
    name = "teamname"
    start_urls = [
        'http://wiki.teamliquid.net/counterstrike/Portal:Teams',
    ]

    def parse(self, response):
        for team in response.css('table:nth-child(5) .team-template-team-standard'):
            item = TeamNameItem()
            item['teamname'] = team.css('.team-template-text a::text').extract_first()
            item['logo'] = team.css('.team-template-image img::attr(src)').extract_first()
            item['link'] = 'http://wiki.teamliquid.net' + team.css('.team-template-text a::attr(href)').extract_first()
            yield item