# Hand-picked meanings for the HSK 2 pack, used by hsk/build.py where the first CC-CEDICT senses are not the HSK 2 sense.
# OVERRIDE: words (the list's 1/2 marks one sense; word|pinyin for a word the list has twice); CHAR_EN: single characters;
# TRAD: traditional forms the dictionary would get wrong for this sense (the app turns characters into traditional ones
# one by one, so 表 stays 表: 手錶 would make every later 表 a 錶).
# NOWORD: characters of the official character list that are in no HSK 2 word, with their lesson (and NOWORD_PY their reading).
# EXTRA: words of the official grammar list that are not in the word list, allowed in sentences (build_grammar.py).
OVERRIDE={'快要':'about to; soon','虽然':'although','长':'long','头':'head','手':'hand','爱好':'hobby; to like (doing)',
  '外国':'foreign country; foreign','小时候':'in one’s childhood','男孩儿':'boy','女孩儿':'girl','小孩儿':'child; kid',
  '时':'time; when','正':'(be) just (doing); straight','着':'(particle: ongoing state)','开始':'to begin; beginning',
  '就':'then; right away; just','跟':'with; and; to follow','但':'but','地':'(particle: -ly, before a verb)',
  '得':'(particle after a verb: how well, how much)','白色':'white','本子':'notebook','条':'(measure word for long, thin things)',
  '包':'to wrap; bag; (measure word for packets)','打开':'to open; to turn on','万':'ten thousand','那么':'so; like that; then',
  '这么':'so; like this','那样':'like that; that kind','这样':'like this; this kind','比':'to compare; (more) than',
  '不错':'not bad; pretty good','离':'(distance) from','后面':'behind; at the back','上面':'on; above; on top','下面':'under; below',
  '里面':'inside','外面':'outside','左':'left','右':'right','左边':'left side','右边':'right side','楼':'building; floor',
  '面1':'(suffix for sides: 前面, 后面)','进':'to enter; to go in','出':'to go out; to come out','上来':'to come up','下来':'to come down',
  '下去':'to go down; to go on','过来':'to come over','起来':'to get up; to rise; (after a verb) up, starting',
  '让':'to let; to make (sb do sth)','别1':'don’t','不好意思':'sorry; excuse me; to feel embarrassed','希望':'to hope; hope',
  '啊':'(particle: surprise, emphasis)','意思':'meaning; idea','还是':'or (in questions); still; had better',
  '点2':'to order (food); to light; to click','往':'toward; to go toward','酒店':'hotel','站1':'station; stop',
  '过|guò':'to cross; to pass; to spend (time)','过|guo':'(particle: have done before)','过去1':'to go over; to pass by',
  '快':'fast; quick; soon','花1':'to spend (money, time)','花2':'flower','票':'ticket','坏':'bad; broken',
  '身体':'body; health','疼':'to hurt; sore','旅游':'to travel; tourism','运动':'sport; to exercise','动':'to move',
  '游':'to swim; to tour','画':'to draw; painting','鸟':'bird','打1':'to hit; to play (ball games)','周':'week',
  '等1':'to wait','题':'question (in a test); topic','考':'to take an exam; to test','错':'wrong; mistake',
  '次':'(measure word for times)','可能':'maybe; possible','一起':'together','经常':'often','班':'class; shift',
  '位':'(polite measure word for people)','间':'(measure word for rooms)','名':'(measure word for people); name',
  '绿茶':'green tea','奶奶':'grandma (father’s mother)','爷爷':'grandpa (father’s father)','红色':'red','颜色':'colour',
  '自己':'oneself; one’s own','介绍':'to introduce','准备':'to prepare; preparation','有时':'sometimes','门':'door; gate',
  '笑':'to laugh; to smile','从':'from','为什么':'why','因为':'because','所以':'so; therefore','事情':'matter; thing',
  '完':'to finish; finished','一会儿':'a moment; a while','忘':'to forget','拿':'to take; to hold','阴':'cloudy, overcast',
  '远':'far','近':'near','门口':'doorway; at the door','送':'to give (as a present); to see sb off; to deliver','帮':'to help',
  '告诉':'to tell','奶茶':'milk tea','红茶':'black tea','饭馆':'restaurant','路':'road; way','路上':'on the way','走':'to walk; to go; to leave',
  '地铁':'subway, metro','公交车':'bus','打车':'to take a taxi','机票':'plane ticket','出门':'to go out','车站':'station; bus stop',
  '出国':'to go abroad','慢':'slow','商场':'shopping mall','裤子':'trousers','门票':'entrance ticket','药':'medicine',
  '跑':'to run','网上':'online','球':'ball','足球':'football, soccer','踢':'to kick; to play (football)','游泳':'to swim',
  '洗':'to wash','洗手间':'toilet, restroom','床':'bed','词':'word','考试':'exam; to take an exam','懂':'to understand',
  '教':'to teach','开学':'school starts','高中':'senior high school','累':'tired','过年':'to celebrate the (Chinese) New Year',
  '快乐':'happy','鱼':'fish','丈夫':'husband','妻子':'wife','个子':'height (of a person)','高':'tall; high','眼睛':'eye',
  '姓':'surname; to be surnamed','姓名':'full name','生日':'birthday','从小':'since childhood','已经':'already','记得':'to remember',
  '虽然':'although','颜色':'colour','黑色':'black','绿色':'green','每':'every; each','笔':'pen','书包':'schoolbag','手表':'watch',
  '晴':'sunny, clear','舒服':'comfortable; well','最':'most; the most','旁边':'beside; next to','前面':'in front; ahead'}
CHAR_EN={'啡':'(as in 咖啡) coffee','咖':'(as in 咖啡) coffee','然':'so; like that','虽':'although','所':'place; (as in 所以) so',
  '经':'to pass through; (as in 已经) already','情':'feeling; situation','着':'(particle: ongoing state)','地':'ground; earth',
  '表':'watch; table; surface','舒':'(as in 舒服) to stretch','旁':'side','别':'don’t; other','诉':'(as in 告诉) to tell',
  '望':'to hope; to look','希':'to hope','馆':'hall; (public) building','场':'place; field','店':'shop; store','交':'to hand over; to make (friends)',
  '铁':'iron','运':'to move; luck','足':'foot; enough','周':'week; circle','留':'to stay; to leave (behind)','试':'to try; test',
  '介':'(as in 介绍) to introduce','绍':'(as in 介绍) to introduce','室':'room','备':'(as in 准备) to prepare','位':'(polite measure word for people); place',
  '准':'accurate; standard','乐':'happy; joy','丈':'(as in 丈夫) husband','夫':'husband; man','爷':'grandpa','己':'(as in 自己) self',
  '眼':'eye','睛':'(as in 眼睛) eye','颜':'(as in 颜色) colour','色':'colour','篮':'basket','步':'step','舞':'to dance; dance',
  '跳':'to jump','游':'to swim; to tour','画':'to draw; painting','次':'(measure word for times); next','考':'to test; to take an exam',
  '教':'to teach','词':'word','错':'wrong; mistake','懂':'to understand','等':'to wait','洗':'to wash','身':'body','体':'body; form',
  '药':'medicine','花':'flower; to spend','坏':'bad; broken','裤':'trousers','票':'ticket','过':'to cross; to pass','酒':'alcohol; wine',
  '快':'fast; quick','路':'road; way','慢':'slow','往':'toward','站':'station; to stand','走':'to walk; to go','红':'red','肉':'meat',
  '啊':'(particle: surprise, emphasis)','帮':'to help','告':'to tell; to announce','让':'to let; to make (sb do sth)','思':'to think',
  '送':'to give; to deliver','意':'meaning; idea','进':'to enter','近':'near','离':'(distance) from; to leave','楼':'building; floor',
  '门':'door; gate','右':'right','远':'far','左':'left','比':'to compare; than','晴':'sunny','阴':'cloudy; shade','最':'most',
  '笔':'pen','黑':'black','绿':'green','每':'every','拿':'to take; to hold','万':'ten thousand','从':'from','但':'but',
  '跟':'with; to follow','记':'to remember; to note down','就':'then; just','始':'to begin','完':'to finish','忘':'to forget',
  '为':'for; (as in 为什么) why','已':'already','因':'cause; because','头':'head','笑':'to laugh; to smile','姓':'surname','长':'long',
  '自':'self; from','动':'to move','旅':'to travel','鸟':'bird','跑':'to run','球':'ball','踢':'to kick','网':'net; internet',
  '泳':'to swim','鱼':'fish','妻':'wife','累':'tired','室':'room'}
TRAD={'手表':'手表'}
NOWORD={'留':'13'}
NOWORD_PY={'留':'liú'}
# 固定短语 什么的, 数词 好多, 频率副词 常, 时间副词 有时候, 固定格式 就要……了, and the halves of the 离合词 跑步, 游泳, 跳舞
EXTRA={'什么的':'shénmede','好多':'hǎoduō','常':'cháng','有时候':'yǒushíhou','就要':'jiùyào','步':'bù','泳':'yǒng','跳':'tiào','舞':'wǔ',
  # three common surnames, for the official task 使用中文称谓语 (姓氏 + 职业: 张老师, 王先生; 姓氏 + 亲属称谓: 张爷爷)
  '王':'Wáng','张':'Zhāng','李':'Lǐ'}
