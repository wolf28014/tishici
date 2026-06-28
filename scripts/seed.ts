import { db } from '@/lib/db'

// ========== 分类定义（含子分类） ==========
type CatDef = {
  name: string
  description: string
  icon: string
  color: string
  sortOrder: number
  parentName?: string
  children?: CatDef[]
}

const CATEGORIES: CatDef[] = [
  { name: '写作创作', description: '文章、故事、文案等创作类提示词', icon: 'PenTool', color: 'rose', sortOrder: 1 },
  { name: '编程开发', description: '编程、代码、技术相关提示词', icon: 'Code2', color: 'emerald', sortOrder: 2 },
  { name: '学习辅导', description: '学习、教学、知识理解提示词', icon: 'GraduationCap', color: 'sky', sortOrder: 3 },
  { name: '生活日常', description: '生活、健康、日常事务提示词', icon: 'Heart', color: 'teal', sortOrder: 4 },
  { name: '工作效率', description: '办公、效率、流程优化提示词', icon: 'Briefcase', color: 'violet', sortOrder: 5 },
  { name: '其他', description: '未分类提示词', icon: 'MoreHorizontal', color: 'slate', sortOrder: 99 },

  // ========== 电商运营 ==========
  {
    name: '电商运营', description: '电商运营全套提示词：选品、文案、客服、推广', icon: 'ShoppingBag', color: 'amber', sortOrder: 6,
    children: [
      { name: '商品文案', description: '标题、卖点、详情页文案', icon: 'FileText', color: 'amber', sortOrder: 1 },
      { name: '主图详情页', description: '商品主图、详情页设计提示词', icon: 'Image', color: 'amber', sortOrder: 2 },
      { name: '客服话术', description: '售前售后、催付、回复模板', icon: 'MessageSquare', color: 'amber', sortOrder: 3 },
      { name: '选品分析', description: '市场调研、竞品分析、爆款挖掘', icon: 'TrendingUp', color: 'amber', sortOrder: 4 },
      { name: '营销推广', description: '直播脚本、活动策划、广告文案', icon: 'Megaphone', color: 'amber', sortOrder: 5 },
    ],
  },

  // ========== AI 模特 / 商拍 ==========
  {
    name: 'AI模特商拍', description: 'AI 模特换装、姿势、场景生成提示词', icon: 'Palette', color: 'pink', sortOrder: 7,
    children: [
      { name: '男装羽绒服', description: '男装羽绒服 AI 模特专用提示词', icon: 'Snowflake', color: 'sky', sortOrder: 1 },
      { name: '通用换装', description: '通用服装换装、虚拟试衣', icon: 'Shirt', color: 'pink', sortOrder: 2 },
      { name: '场景生成', description: '拍摄场景、背景、环境', icon: 'Mountain', color: 'pink', sortOrder: 3 },
      { name: '姿势动作', description: '模特姿势、动作、表情', icon: 'PersonStanding', color: 'pink', sortOrder: 4 },
    ],
  },

  // ========== AI 短剧 ==========
  {
    name: 'AI短剧制作', description: 'AI 短剧全流程：剧本→分镜→视频→配音→剪辑', icon: 'Clapperboard', color: 'rose', sortOrder: 8,
    children: [
      { name: '剧本创作', description: '故事大纲、角色设定、对白', icon: 'BookOpen', color: 'rose', sortOrder: 1 },
      { name: '分镜设计', description: '镜头脚本、画面描述', icon: 'LayoutGrid', color: 'rose', sortOrder: 2 },
      { name: '视频生成', description: '图生视频、文生视频', icon: 'Video', color: 'rose', sortOrder: 3 },
      { name: '配音配乐', description: 'AI 配音、BGM、音效', icon: 'Music', color: 'rose', sortOrder: 4 },
      { name: '剪辑包装', description: '剪辑、字幕、转场', icon: 'Scissors', color: 'rose', sortOrder: 5 },
    ],
  },
]

// ========== 提示词数据 ==========
type PromptDef = {
  title: string
  description?: string
  content: string
  categoryName: string // 子分类名称（或顶级分类名）
  tags?: string[]
  isPinned?: boolean
  isFavorite?: boolean
  author?: string
}

const PROMPTS: PromptDef[] = [
  // ============ 写作创作 ============
  {
    title: '爆款小红书种草文案',
    description: '生成吸引眼球的小红书种草笔记文案，自带 emoji 和话题标签',
    content: `你现在是一位拥有百万粉丝的小红书种草达人。请为以下产品/主题写一篇种草笔记：

【主题】{{主题}}
【产品特点】{{产品特点}}
【目标人群】{{目标人群}}

要求：
1. 标题要吸睛，使用数字+痛点+利益的公式
2. 正文使用「人设+场景+痛点+解决方案+使用感受+效果对比」结构
3. 适当使用 emoji 增加亲和力，但不要过度
4. 结尾引导互动，激发评论
5. 添加 5-8 个相关话题标签 #XX
6. 字数控制在 300-500 字`,
    categoryName: '写作创作',
    tags: ['文案', '小红书', '种草', '营销'],
    isPinned: true,
  },
  {
    title: '微信公众号深度长文',
    description: '生成结构清晰、有深度的微信公众号文章',
    content: `你是一位资深公众号主笔，擅长撰写有深度、有共鸣的长文。请根据以下信息创作：

【主题】{{主题}}
【核心观点】{{核心观点}}
【目标读者】{{目标读者}}
【字数要求】{{字数要求}}

写作要求：
1. 开头用故事或问题切入，3 秒抓住读者注意力
2. 全文使用「金句+案例+分析+方法」的节奏推进
3. 每 200 字左右设置一个情绪点或认知冲击
4. 段落之间使用过渡句，确保逻辑流畅
5. 结尾要有「升华」或「行动号召」，避免虎头蛇尾
6. 适当使用小标题拆分文章，提升可读性`,
    categoryName: '写作创作',
    tags: ['公众号', '长文', '写作'],
  },
  {
    title: '小说人物对话生成器',
    description: '生成符合人物性格的小说对话，自带场景描述',
    content: `你是一位擅长刻画人物的小说家。请根据以下设定创作一段对话：

【人物A】姓名：{{A姓名}}，性格：{{A性格}}，身份：{{A身份}}
【人物B】姓名：{{B姓名}}，性格：{{B性格}}，身份：{{B身份}}
【场景】{{场景描述}}
【冲突/目的】{{冲突或目的}}

要求：
1. 对话要符合各自性格特征，避免千人一面
2. 穿插神态、动作、心理描写，让画面立体
3. 通过对话推进情节，不要为对话而对话
4. 暗含潜台词，体现人物之间的张力
5. 对话长度 800-1200 字`,
    categoryName: '写作创作',
    tags: ['小说', '对话', '创作'],
  },

  // ============ 编程开发 ============
  {
    title: '代码 Review 专家',
    description: '专业级代码审查，发现潜在 bug 和优化点',
    content: `你是一位拥有 15 年经验的资深工程师，精通代码审查。请审查以下代码：

【编程语言】{{编程语言}}
【代码】
{{代码内容}}

【项目背景】{{项目背景或留空}}

请从以下维度审查：
1. **Bug 风险**：潜在的空指针、数组越界、并发问题等
2. **性能问题**：时间/空间复杂度、不必要的计算、I/O 优化
3. **可读性**：命名、注释、代码结构、函数拆分
4. **安全性**：SQL 注入、XSS、敏感信息泄露、权限校验
5. **最佳实践**：是否符合该语言的惯用写法和框架规范
6. **可维护性**：扩展性、耦合度、测试友好度

输出格式：
- 严重问题（必须修改）
- 建议改进（推荐修改）
- 优化建议（锦上添花）
- 总体评价（1-10 分）`,
    categoryName: '编程开发',
    tags: ['代码审查', 'Code Review', '质量'],
    isPinned: true,
  },
  {
    title: 'SQL 查询优化助手',
    description: '分析 SQL 语句并给出优化方案，包括索引建议',
    content: `你是一位数据库性能优化专家。请分析并优化以下 SQL：

【数据库类型】{{MySQL/PostgreSQL/其他}}
【表结构】
{{表结构DDL}}

【原 SQL】
{{SQL语句}}

【执行场景】{{数据量级、查询频率等背景}}

请输出：
1. **性能分析**：当前 SQL 的潜在性能问题
2. **执行计划解读**：可能的执行计划及瓶颈
3. **优化方案**：SQL 重写版本 + 推荐索引 + 表结构调整
4. **预期收益**：优化后的性能提升预估
5. **注意事项**：可能的副作用或兼容性问题`,
    categoryName: '编程开发',
    tags: ['SQL', '数据库', '性能优化'],
  },
  {
    title: '技术方案设计文档',
    description: '生成完整的技术方案设计文档，含架构图描述',
    content: `你是一位架构师，请为以下需求设计技术方案：

【需求描述】{{需求描述}}
【技术栈约束】{{技术栈或留空}}
【非功能需求】{{QPS/可用性/数据量等}}
【现有系统】{{现有系统或留空}}

请输出完整设计文档：

# 一、背景与目标
## 1.1 需求分析  ## 1.2 目标与非目标

# 二、整体架构
## 2.1 架构图（用 Mermaid 描述）  ## 2.2 模块划分  ## 2.3 关键流程（Mermaid 时序图）

# 三、详细设计
## 3.1 数据模型  ## 3.2 接口设计  ## 3.3 核心算法/逻辑

# 四、非功能设计
## 4.1 性能  ## 4.2 可用性  ## 4.3 安全

# 五、上线计划
## 5.1 灰度方案  ## 5.2 监控告警  ## 5.3 回滚方案

# 六、风险评估`,
    categoryName: '编程开发',
    tags: ['架构设计', '技术方案', '文档'],
  },

  // ============ 学习辅导 ============
  {
    title: '费曼学习法讲解员',
    description: '用费曼学习法把复杂概念讲给小白听',
    content: `你是一位精通费曼学习法的老师。请用以下方式讲解这个概念：

【概念】{{概念名称}}
【学习者背景】{{如：高中生、产品经理、零基础}}

讲解结构：
1. 一句话定义（不超过 30 字，无专业术语）
2. 生活中的类比
3. 为什么需要它（解决什么问题）
4. 核心要素拆解（3-5 个）
5. 一个完整例子
6. 常见误解（2-3 个）
7. 如何检验自己懂了（3 个问题）

要求：全程避免术语堆砌，必要时用括号注释术语含义。`,
    categoryName: '学习辅导',
    tags: ['费曼', '讲解', '学习'],
    isPinned: true,
  },
  {
    title: '读书笔记生成器',
    description: '从书中提炼核心观点、金句和行动清单',
    content: `你是一位资深读书博主。请为以下书籍生成高质量读书笔记：

【书名】{{书名}}
【作者】{{作者}}
【阅读目的】{{我想从中获得什么}}

请输出结构化读书笔记：
1. 一句话总结（≤30字）
2. 核心观点（3-5 个，含论证和反思）
3. 金句摘录（5-8 句，标注页码）
4. 思维导图（用 Mermaid 描述全书结构）
5. 应用清单（3-5 个具体行动）
6. 关联阅读（推荐 3 本相关书籍）
7. 一句话推荐（什么人应该读这本书）`,
    categoryName: '学习辅导',
    tags: ['读书', '笔记', '总结'],
  },

  // ============ 工作效率 ============
  {
    title: '会议纪要整理专家',
    description: '把杂乱的会议记录整理成清晰的会议纪要',
    content: `你是一位会议纪要专家。请将以下会议记录整理为规范的会议纪要：

【会议主题】{{主题}}
【会议时间】{{时间}}
【参会人员】{{人员}}
【原始记录】
{{会议记录内容}}

请输出：
# 会议纪要
## 一、会议信息
## 二、会议背景
## 三、讨论要点（按议题分组：观点、共识、未解决问题）
## 四、决议事项（含负责人和完成时间）
## 五、行动清单 Action Items（表格形式：序号|任务|负责人|截止日期|验收标准）
## 六、下次会议建议`,
    categoryName: '工作效率',
    tags: ['会议', '纪要', '办公'],
    isPinned: true,
  },
  {
    title: '工作周报生成器',
    description: '把碎片化工作记录整理成结构化周报',
    content: `你是一位擅长结构化表达的职场人。请将以下工作记录整理为周报：

【本周时间】{{日期范围}}
【岗位】{{岗位}}
【原始工作记录】
{{本周做的事，可以零散}}

请输出：
# 周报 {{日期范围}}
## 一、本周工作总结
### 1. 重点工作 Top 3（含完成情况、价值/影响）
### 2. 常规工作
### 3. 临时性工作
## 二、关键数据（表格：指标|本周|上周|环比）
## 三、问题与思考
## 四、下周计划（Top 5 含预期成果）
## 五、需要的支持

风格要求：客观、量化、有价值导向，避免流水账。`,
    categoryName: '工作效率',
    tags: ['周报', '汇报', '办公'],
  },

  // ============ 生活日常 ============
  {
    title: '健身训练计划定制',
    description: '根据个人情况定制科学的健身训练计划',
    content: `你是一位持有 NASM-CPT 认证的私人教练。请为以下用户定制训练计划：

【基本信息】性别：{{性别}}，年龄：{{年龄}}，身高：{{身高}}，体重：{{体重}}
【训练目标】{{减脂/增肌/塑形/力量/耐力}}
【训练经验】{{小白/业余/有基础}}
【可训练频率】{{每周X次，每次Y分钟}}
【场地限制】{{健身房/家中无器械/家中哑铃}}
【健康状况】{{有无伤病或慢病}}

请输出 4 周训练计划：
## 一、身体评估与建议
## 二、训练原则
## 三、4 周计划表（每周：动作/组数/次数/休息时间）
## 四、关键动作说明（5-8 个核心动作要点）
## 五、饮食建议（热量目标、营养素配比、训练前后饮食）
## 六、注意事项与进阶标准`,
    categoryName: '生活日常',
    tags: ['健身', '训练', '健康'],
  },
  {
    title: '旅行行程规划师',
    description: '生成详细的旅行行程，含交通、餐饮、住宿建议',
    content: `你是一位资深旅行规划师。请为以下需求定制旅行行程：

【目的地】{{目的地}}
【出发地】{{出发地}}
【出行天数】{{N天M晚}}
【出行人数】{{人数及关系}}
【出行时间】{{日期或季节}}
【预算】{{预算范围}}
【偏好】{{如：人文/自然/美食/购物/亲子}}
【特殊需求】{{如：素食/无障碍/带宠物}}

请输出：
## 一、行前准备（证件、必备物品、当地注意事项）
## 二、交通方案
## 三、住宿建议
## 四、每日行程（上午/下午/晚上 + 景点 + 餐饮 + 交通 + 预算）
## 五、备选景点
## 六、应急信息
## 七、预算汇总`,
    categoryName: '生活日常',
    tags: ['旅行', '行程', '规划'],
  },

  // ============ 电商运营 - 商品文案 ============
  {
    title: '淘宝/天猫商品标题优化',
    description: '根据商品信息生成 SEO 友好的高点击商品标题',
    content: `你是一位电商运营专家，专精商品标题 SEO 优化。请为以下商品生成 5 个高点击标题：

【商品名称】{{商品名称}}
【核心卖点】{{核心卖点}}
【目标人群】{{目标人群}}
【类目】{{类目，如：男装/羽绒服}}
【价格区间】{{价格}}
【品牌】{{品牌或留空}}

要求：
1. 每个标题严格控制在 30 个汉字以内（淘宝限制）
2. 核心关键词放在标题前 1/3
3. 覆盖：品牌词 + 类目词 + 属性词 + 卖点词 + 长尾词
4. 避免堆砌，符合用户搜索习惯
5. 每个标题给出关键词拆解说明（为什么这样组合）
6. 给出预估搜索量和竞争度评估

最后给出 Top 1 推荐及理由。`,
    categoryName: '商品文案',
    tags: ['标题', 'SEO', '淘宝', '电商'],
    isPinned: true,
    author: '电商运营组',
  },
  {
    title: '电商详情页 5 段式文案',
    description: '生成高转化率的电商商品详情页文案（痛点-卖点-证据-场景-保障）',
    content: `你是一位电商详情页文案专家。请为以下商品生成详情页文案：

【商品名称】{{商品名称}}
【商品卖点】{{商品卖点列表}}
【目标人群】{{目标人群}}
【价格】{{价格}}
【竞品对比】{{竞品弱点或留空}}

请按 5 段式输出：

## 一、痛点唤醒（首屏）
3 句话戳中用户痛点，让 TA 觉得"这说的就是我"

## 二、核心卖点（详细展开）
针对 3 个核心卖点，每个：
- 卖点标题（≤10字，含数据或对比）
- 详细说明（30-50字）
- 证据：参数/对比/认证

## 三、信任背书
销量、评价、权威认证、媒体报道（如虚构请标注 [示例]）

## 四、使用场景
3 个生活化场景，让用户"代入使用"

## 五、购买保障
7天无理由、运费险、质保、售后政策

## 六、常见 FAQ（5 个高频问题）`,
    categoryName: '商品文案',
    tags: ['详情页', '文案', '转化', '电商'],
    author: '电商运营组',
  },
  {
    title: '商品卖点提炼专家',
    description: '从产品特性中提炼出打动用户的卖点',
    content: `你是一位资深营销策划。请基于以下产品信息提炼卖点：

【产品名称】{{产品名称}}
【产品类别】{{产品类别}}
【核心功能】{{核心功能列表}}
【目标用户】{{目标用户}}
【竞品对比】{{竞品对比或留空}}

请输出：

## 一、FAB 卖点矩阵
对每个功能提取：
- Feature（功能）：产品有什么
- Advantage（优势）：比同类好在哪里
- Benefit（利益）：用户能获得什么

## 二、核心卖点 Top 3
按"用户决策权重"排序，每个卖点配一句话文案

## 三、差异化定位
一句话说清"我们是谁，他们不是"

## 四、用户场景化卖点
针对 3 个核心使用场景，分别给出场景化表达

## 五、信任状
用什么证据让用户相信以上卖点（数据、案例、权威背书）`,
    categoryName: '商品文案',
    tags: ['卖点', '营销', '产品', '电商'],
    isPinned: true,
    author: '电商运营组',
  },
  {
    title: '直播带货话术脚本',
    description: '生成 30 分钟直播单品的带货话术脚本',
    content: `你是一位拥有 5 年经验的头部带货主播。请为以下商品生成直播话术脚本：

【商品名称】{{商品名称}}
【商品卖点】{{商品卖点}}
【原价】{{原价}}
【直播价】{{直播价}}
【库存】{{库存数量}}
【主播人设】{{如：亲切大姐/专业测评/时尚达人}}

请输出 30 分钟完整脚本，分阶段：

## 阶段一：暖场引入（5 分钟）
- 开场白（人设+今天福利预告）
- 痛点切入（3 个让用户共鸣的场景）

## 阶段二：产品介绍（10 分钟）
- 产品亮相（悬念+揭秘）
- 卖点讲解（每个卖点配演示/对比/数据）
- 使用场景展示

## 阶段三：信任建立（5 分钟）
- 用户证言（评价截图口播）
- 现场测试/对比实验
- 售后保障承诺

## 阶段四：逼单转化（8 分钟）
- 价格锚定（原价 vs 直播价）
- 限量限时话术（紧迫感）
- 福利叠加（赠品、抽奖）
- 倒计时口播

## 阶段五：答疑收尾（2 分钟）
- 高频问题解答
- 下期预告

每段给出具体口播词，标注动作/表情。`,
    categoryName: '营销推广',
    tags: ['直播', '带货', '话术', '电商'],
    author: '电商运营组',
  },

  // ============ 电商运营 - 客服话术 ============
  {
    title: '电商客服催付话术',
    description: '生成多种场景的催付话术，提升订单转化率',
    content: `你是一位资深电商客服主管。请根据以下场景生成催付话术：

【商品】{{商品}}
【客户行为】{{如：拍下未付/加购未付/咨询后未下单}}
【客户画像】{{如：新客/老客/价格敏感/品质敏感}}
【店铺调性】{{如：亲切型/专业型/高端型}}

请生成 5 套不同策略的催付话术：

1. **福利催付**：限时优惠/赠品
2. **库存催付**：库存紧张/即将断码
3. **服务催付**：今日下单今日发/优先发货
4. **关怀催付**：询问是否需要帮助
5. **价值催付**：强调品质/售后保障

每套话术：
- 适用场景
- 话术正文（80-150 字，亲切自然，不油腻）
- 发送时机建议

最后给出 A/B 测试建议：哪套话术适合哪类客户。`,
    categoryName: '客服话术',
    tags: ['客服', '催付', '转化', '电商'],
    author: '电商运营组',
  },
  {
    title: '差评回复与危机处理',
    description: '生成专业的差评回复，化解危机并挽回口碑',
    content: `你是一位电商客服与口碑管理专家。请为以下差评生成回复：

【商品】{{商品}}
【差评内容】{{差评原文}}
【客户情绪】{{如：愤怒/失望/吐槽/恶意}}
【实际问题】{{如：质量/物流/描述不符/客服态度}}
【可提供的解决方案】{{如：退款/换货/补偿券}}

请输出：

## 一、问题分析
- 客户真实诉求（表面问题 vs 深层诉求）
- 公关风险评估（高/中/低）

## 二、回复话术（3 个版本）

### 版本 A：真诚致歉型
适用：确实存在问题，客户情绪激烈
话术正文（150-200 字，结构：致歉+认同+方案+补偿+后续改进）

### 版本 B：客观解释型
适用：存在误会或客户理解偏差
话术正文（150-200 字，结构：感谢反馈+事实澄清+解决方案+邀请私聊）

### 版本 C：轻松化解型
适用：吐槽性质，客户情绪温和
话术正文（150-200 字，结构：幽默回应+认同+小补偿+期待再服务）

## 三、后续跟进建议
- 是否需要主动私聊
- 是否需要平台介入
- 内部改进措施`,
    categoryName: '客服话术',
    tags: ['客服', '差评', '危机公关', '电商'],
    author: '电商运营组',
  },
  {
    title: '售后问题处理 SOP',
    description: '生成各类售后问题的标准处理流程',
    content: `你是一位电商售后主管。请为以下售后问题生成处理 SOP：

【商品类目】{{类目}}
【问题类型】{{如：质量问题/物流损坏/7天无理由/描述不符/退换货}}
【客户诉求】{{客户具体诉求}}
【平台规则】{{淘宝/京东/抖音等平台规则要点}}

请输出：

## 一、问题定级
- 紧急程度（高/中/低）
- 涉及金额
- 是否可能升级投诉

## 二、处理流程（SOP）
### Step 1: 接收与确认（话术 + 时限）
### Step 2: 问题核实（需要客户提供什么证据）
### Step 3: 方案给出（退款/换货/补偿，含话术）
### Step 4: 执行跟进（物流/系统操作）
### Step 5: 回访与归档

## 三、话术模板
- 接收话术
- 核实话术
- 方案话术
- 完结话术

## 四、边界情况
- 客户不接受方案怎么办
- 涉及平台介入怎么办
- 涉及工商投诉怎么办

## 五、预防措施
- 该类问题的根本预防建议`,
    categoryName: '客服话术',
    tags: ['客服', '售后', 'SOP', '电商'],
    author: '电商运营组',
  },

  // ============ 电商运营 - 选品分析 ============
  {
    title: '电商选品市场分析',
    description: '深度分析某品类市场，给出选品建议',
    content: `你是一位资深电商选品专家。请深度分析以下品类的市场并给出选品建议：

【目标品类】{{品类，如：男装羽绒服}}
【目标平台】{{淘宝/天猫/京东/抖音/拼多多/跨境}}
【预算】{{起订预算}}
【供应链优势】{{自有工厂/源头货/代发/品牌授权}}

请输出完整选品分析报告：

## 一、市场概况
- 市场规模与增速
- 季节性特征（淡旺季）
- 价格带分布（高/中/低各占比）
- 头部品牌与集中度

## 二、需求分析
- Top 10 高频搜索词（含搜索量级）
- 用户画像（年龄/性别/地域/消费力）
- 痛点与未被满足的需求

## 三、竞争分析
- 头部玩家及打法
- 同价位竞品对比（5 款）
- 差异化机会点

## 四、选品建议
### 推荐方向 Top 3
每个方向：
- 产品定位
- 目标价格带
- 核心卖点
- 预估月销
- 风险点

## 五、上架策略
- 首批 SKU 数量
- 测款方法
- 备货节奏

## 六、风险提示`,
    categoryName: '选品分析',
    tags: ['选品', '市场分析', '电商'],
    isPinned: true,
    author: '电商运营组',
  },
  {
    title: '竞品深度拆解',
    description: '从多维度拆解竞品，找出超越机会',
    content: `你是一位电商竞品分析师。请深度拆解以下竞品：

【竞品名称/店铺】{{竞品}}
【竞品链接】{{链接}}
【所在类目】{{类目}}
【我方定位】{{我方产品/品牌定位}}

请输出竞品拆解报告：

## 一、基本信息
- 店铺/品牌背景
- 主推 SKU 与销量
- 价格带分布

## 二、商品分析
- Top 5 爆款拆解（卖点、定价、用户评价关键词）
- 商品结构（引流款/利润款/形象款）
- 上新节奏

## 三、视觉分析
- 主图风格（构图/色调/卖点表达）
- 详情页结构（页面逻辑、卖点顺序）
- 视频内容（直播切片/产品演示/场景化）

## 四、流量与营销
- 主要流量来源（搜索/推荐/直播/活动/直通车）
- 营销节奏（大促/日常/内容种草）
- 达人合作情况

## 五、用户口碑
- 好评关键词 Top 10
- 差评关键词 Top 5（找出可攻击点）
- 问答区高频问题

## 六、超越机会
- 我方可以差异化的 3 个方向
- 短期可抢的流量口子
- 中长期需要构建的能力`,
    categoryName: '选品分析',
    tags: ['竞品', '分析', '电商'],
    author: '电商运营组',
  },

  // ============ 电商运营 - 营销推广 ============
  {
    title: '电商大促活动策划',
    description: '生成完整的电商大促活动策划方案',
    content: `你是一位电商活动策划专家。请为以下大促生成完整策划方案：

【活动节点】{{如：双11/618/年货节/38节}}
【参与商品】{{商品清单与品类}}
【目标 GMV】{{目标GMV}}
【预算】{{营销预算}}
【店铺定位】{{高端/性价比/小众}}

请输出完整策划：

## 一、活动目标拆解
- 总 GMV 目标
- 拆解到流量×转化×客单价
- 各品类/各 SKU 目标分摊

## 二、活动节奏（4 阶段）
### 蓄水期（前 15 天）：种草、加购、预告
### 预热期（前 5 天）：付定、收藏、福利解锁
### 爆发期（活动当天）：付尾款、限时秒杀
### 返场期（后 3 天）：清仓、复购、追单

每阶段：核心动作 + 资源投入 + 关键指标

## 三、玩法设计
- 跨店满减 / 限时秒杀 / 福袋 / 抽奖
- 每种玩法的规则与成本测算

## 四、流量矩阵
- 站内：搜索/推荐/直播/直通车/超级推荐
- 站外：小红书/抖音/微信/短信
- 内容：种草笔记/短视频/直播切片
- 各渠道预算分配

## 五、视觉方案
- 主视觉概念
- 详情页/首页/直播间的统一调性
- 关键素材清单

## 六、应急预案
- 流量不及预期的备选方案
- 库存断货的处理
- 客诉激增的应对

## 七、复盘指标
- GMV / ROI / 转化率 / 客单价 / 复购率`,
    categoryName: '营销推广',
    tags: ['大促', '活动策划', '双11', '电商'],
    author: '电商运营组',
  },
  {
    title: '小红书种草笔记（电商引流版）',
    description: '生成带货属性的小红书种草笔记，含购买引导',
    content: `你是一位小红书带货达人。请为以下商品写一篇种草笔记（电商引流版）：

【商品名称】{{商品名称}}
【商品卖点】{{商品卖点}}
【价格】{{价格}}
【目标人群】{{目标人群}}
【使用场景】{{使用场景}}
【搜索关键词】{{希望被搜到的关键词}}

请输出：

## 标题（3 个备选）
- 每个标题 ≤20 字
- 包含数字+情绪+利益点
- 命中至少 1 个搜索关键词

## 正文（500-700 字）
结构：
1. 开篇 hook（1-2 句，制造好奇或共鸣）
2. 痛点引入（用过什么/踩过什么坑）
3. 产品介绍（自然带出，不硬广）
4. 使用体验（具体到细节、数据、对比）
5. 适用人群（让目标用户自我代入）
6. 购买引导（"链接在评论"或"私信关键词"）

## 视觉建议
- 首图：什么场景、什么构图、突出什么
- 内页图：4-6 张，每张说明拍什么
- 视频脚本（如做视频版）：30 秒分镜

## 话题标签（8-10 个）
- 大词（流量）+ 中词（精准）+ 小词（长尾）

## 评论区互动话术
- 引导加购的回复模板（3 条）
- 应对"是不是广告"的回复`,
    categoryName: '营销推广',
    tags: ['小红书', '种草', '带货', '电商'],
    author: '电商运营组',
  },

  // ============ 电商运营 - 主图详情页 ============
  {
    title: '电商主图 5 张结构设计',
    description: '设计电商商品 5 张主图的内容结构与文案',
    content: `你是一位电商视觉策划。请为以下商品设计 5 张主图的完整方案：

【商品名称】{{商品名称}}
【商品卖点】{{商品卖点列表}}
【目标人群】{{目标人群}}
【类目】{{类目}}
【价格】{{价格}}

请输出 5 张主图设计方案：

## 第 1 张：吸睛图（首图）
- 视觉概念（让用户在信息流中停下）
- 主文案（≤10 字，含最大卖点）
- 副文案（≤15 字，补充信息）
- 构图建议（主体位置/角度/背景）

## 第 2 张：卖点图 1（核心功能）
- 卖点提炼
- 视觉表现方式（对比/演示/数据可视化）
- 文案

## 第 3 张：卖点图 2（差异化）
- 与竞品的核心差异
- 视觉表现
- 文案

## 第 4 张：场景图（使用场景）
- 场景设定（让用户代入）
- 模特/道具建议
- 文案

## 第 5 张：促销图（利益点）
- 优惠信息（满减/赠品/限时）
- 行动号召
- 视觉风格（紧迫感）

每张图附：尺寸建议（800×800）、色调、风格参考`,
    categoryName: '主图详情页',
    tags: ['主图', '视觉', '电商'],
    author: '电商运营组',
  },
  {
    title: '商品白底主图 AI 生成提示词',
    description: '生成商品白底主图的 SD/MJ 提示词',
    content: `你是一位 AI 商业摄影提示词工程师。请为以下商品生成白底主图提示词：

【商品】{{商品名称，如：男装羽绒服}}
【材质】{{材质}}
【颜色】{{颜色}}
【卖点】{{需要突出的卖点，如：蓬松度/防水/拉链}}
【AI 工具】{{Stable Diffusion/Midjourney/即梦}}

请输出：

## 正向提示词（Positive Prompt）
按权重组织，英文逗号分隔：
1. 主体描述（商品 + 角度 + 状态）
2. 材质与细节（面料纹理、缝线、五金）
3. 光影（专业摄影光、柔光箱、无反光）
4. 背景（pure white background）
5. 镜头与画质（85mm, f/8, 8K, ultra-detailed, commercial photography）

## 负向提示词（Negative Prompt）
通用负向 + 针对性负向（如：褶皱、线头、色差）

## 推荐参数
- 模型：{{推荐 checkpoint 或 LoRA}}
- Steps: 30-40
- CFG Scale: 7-8
- Sampler: DPM++ 2M Karras
- Size: 1024×1024 或 832×1216
- Hires.fix: 开启，重绘幅度 0.3-0.4

## 后期建议
- 抠图工具
- 调色建议
- 加阴影/倒影的方法`,
    categoryName: '主图详情页',
    tags: ['主图', '白底图', 'AI绘画', '电商'],
    author: '电商运营组',
  },

  // ============ AI 模特商拍 - 男装羽绒服（10 条精选）============
  {
    title: '【男装羽绒服】AI模特换装基础工作流',
    description: '从平铺图/挂拍图生成 AI 模特上身图的基础工作流提示词',
    content: `你是 AI 服装电商商拍专家。请生成「男装羽绒服 AI 模特换装」的基础提示词工作流：

【羽绒服款式】{{款式描述，如：黑色中长款连帽羽绒服}}
【拍摄风格】{{如：电商白底/街拍/室内温暖}}
【模特要求】{{如：亚洲男性/25-35岁/身高180/瘦削体型}}
【AI 工具】{{Stable Diffusion + ComfyUI / Midjourney / 即梦}}

请输出完整工作流：

## Step 1：服装图准备
- 平铺图拍摄要求（角度、光线、背景）
- 或挂拍图处理建议
- 抠图与去背景工具推荐

## Step 2：模特底图生成
正向提示词（英文）：
\`\`\`
1boy, asian male, 25 years old, slim athletic build, 180cm tall,
short black hair, clean shaven, neutral expression,
standing pose, full body shot,
simple studio background, soft lighting,
8k, ultra-detailed, photorealistic, commercial photography
\`\`\`
负向提示词：\`deformed, extra limbs, bad face, low quality, watermark\`

## Step 3：换装工作流（ComfyUI）
- 节点 1：加载模特图 + 服装图
- 节点 2：IP-Adapter（服装参考）
- 节点 3：ControlNet OpenPose（姿势控制）
- 节点 4：Inpainting（局部重绘服装区域）
- 关键参数：denoising strength 0.6-0.75, IP-Adapter weight 0.8

## Step 4：后期优化
- 面料质感强化（羽绒服蓬松感、缝线）
- 颜色还原（与实物色卡对比）
- 阴影与褶皱自然度

## Step 5：批量变体
- 同款不同色（2-3 色）
- 同款不同角度（正面/侧面/背面）
- 同款不同姿势（站立/行走/插兜）

## 推荐模型
- 大模型：realisticVisionV60 / majicMIX realistic
- LoRA：服装细节强化 / 男模体型
- ControlNet：OpenPose + Depth + Canny`,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '换装', '羽绒服', '男装', 'ComfyUI', '电商'],
    isPinned: true,
    author: 'AI商拍组',
  },
  {
    title: '【男装羽绒服】街拍场景提示词',
    description: '生成男装羽绒服城市街拍风格 AI 模特图',
    content: `你是一位 AI 时尚街拍摄影师。请为男装羽绒服生成街拍场景提示词：

【羽绒服款式】{{款式，如：军绿色短款工装羽绒服}}
【场景】{{如：东京街头/纽约曼哈顿/北京三里屯/北欧雪国}}
【模特】{{如：亚洲男性/欧洲男性/年龄/发型}}
【氛围】{{如：冬日冷峻/温暖治愈/潮流酷感}}
【AI 工具】{{Midjourney / Stable Diffusion / 即梦}}

请输出 3 个版本的完整提示词：

## 版本 A：城市街头潮流风
**正向 Prompt（英文）**：
\`\`\`
1boy, asian male, 28 years old, stylish urban outfit,
{{羽绒服款式描述 in English}},
standing on a busy Tokyo street, neon lights, evening,
candid street photography, shallow depth of field,
bokeh background, cinematic lighting,
shot on Sony A7R IV, 50mm f/1.4,
8k, ultra-detailed, photorealistic, fashion editorial
\`\`\`

## 版本 B：冬日雪景户外风
**正向 Prompt（英文）**：
\`\`\`
1boy, male model wearing {{羽绒服款式}},
standing in snowy mountain landscape,
golden hour sunlight, breath visible in cold air,
epic scenery, snow covered pine trees,
professional outdoor photography,
Patagonia catalog style,
shot on Canon EOS R5, 35mm f/2.0,
8k, ultra-detailed, cinematic
\`\`\`

## 版本 C：室内温暖咖啡馆风
**正向 Prompt（英文）**：
\`\`\`
1boy, male wearing {{羽绒服款式}},
sitting by window in cozy coffee shop,
warm interior lighting, steam from coffee cup,
rainy winter day outside, soft natural light,
lifestyle photography, ikea catalog aesthetic,
shot on Fujifilm X-T5, 56mm f/1.2,
8k, ultra-detailed, photorealistic
\`\`\`

## 通用负向 Prompt
\`ugly, deformed, bad anatomy, extra fingers, blurry, lowres, watermark, text, logo, distorted face, unnatural pose, plastic skin\`

## Midjourney 参数建议
- 长宽比：--ar 3:4（电商主图）或 --ar 9:16（短视频）
- 风格化：--stylize 250
- 版本：--v 6
- 质量：--q 2

## 即梦/可灵 中文提示词版本
（提供等价的中文版本，便于国产工具使用）`,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '街拍', '场景', '羽绒服', '电商'],
    isPinned: true,
    author: 'AI商拍组',
  },
  {
    title: '【男装羽绒服】雪景拍摄场景',
    description: '专门为羽绒服设计的雪景拍摄 AI 提示词',
    content: `你是一位专业冬季服装商拍摄影师。请为男装羽绒服生成雪景场景提示词：

【羽绒服款式】{{款式，如：白色长款羽绒服}}
【雪景类型】{{如：林海雪原/城市雪景/雪山远景/雪地木屋}}
【光线】{{如：晨光/正午/黄昏/阴天柔光}}
【氛围】{{如：户外探险/度假休闲/极地科考}}

请输出雪景拍摄提示词套装：

## 场景 1：林海雪原（突出保暖性）
\`\`\`
1boy, male model wearing {{羽绒服}},
standing in snowy pine forest,
knee-deep snow, frosted trees,
soft overcast lighting, diffuse light,
cold breath visible, rosy cheeks,
professional outdoor photography,
North Face catalog style,
shot on Canon EOS R5, 24-70mm f/2.8,
8k, ultra-detailed, photorealistic
\`\`\`

## 场景 2：城市雪景（突出日常实穿）
\`\`\`
1boy, male wearing {{羽绒服}},
walking on snowy city sidewalk,
brownstone buildings background,
snow falling, street lamps glow,
candid street photography,
winter lifestyle aesthetic,
shot on Leica Q3, 28mm f/1.7,
8k, ultra-detailed, cinematic
\`\`\`

## 场景 3：雪山远景（突出户外功能）
\`\`\`
1boy, male wearing {{羽绒服}},
standing on mountain ridge,
epic snow peaks background,
golden hour alpenglow,
wide angle landscape,
Patagonia / Arc'teryx catalog style,
shot on Sony A7R V, 16-35mm f/4,
8k, ultra-detailed, epic scenery
\`\`\`

## 场景 4：雪地木屋（突出温暖治愈）
\`\`\`
1boy, male wearing {{羽绒服}},
leaning on wooden cabin in snow,
smoke from chimney, warm window light,
cozy winter vibe, hygge aesthetic,
lifestyle photography,
shot on Hasselblad X2D, 65mm f/2.8,
8k, ultra-detailed, photorealistic
\`\`\`

## 雪景拍摄技巧
- 雪地反光强，曝光需 +0.7~+1.3 EV
- 利用雪的洁净突出羽绒服颜色
- 雪花飘落用 1/60s 快门拍出动态
- 模特哈气、红鼻头增加真实感
- 后期：高光保留雪的纹理，避免死白

## 反向提示词（避免常见错误）
\`melting snow, wet clothes, summer, green leaves, indoor, fake snow\``,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '雪景', '羽绒服', '场景', '电商'],
    isPinned: true,
    author: 'AI商拍组',
  },
  {
    title: '【男装羽绒服】姿势动作提示词',
    description: '男装羽绒服模特姿势动作的完整提示词库',
    content: `你是一位 AI 模特姿势设计专家。请为男装羽绒服设计姿势动作提示词：

【羽绒服款式】{{款式}}
【用途】{{如：详情页多角度展示/主图/短视频}}
【模特类型】{{如：高大威猛/清瘦文艺/运动健壮}}

请输出 8 个常用姿势的提示词：

## 姿势 1：站立正面（标准展示）
\`\`\`
1boy, standing front view, full body,
hands in jacket pockets,
relaxed confident posture,
weight evenly distributed,
looking at camera,
neutral expression
\`\`\`
**适用**：主图、详情页头图

## 姿势 2：侧身 45 度（显瘦显高）
\`\`\`
1boy, standing 45-degree angle,
one hand in pocket, other hand relaxed,
weight on back leg,
looking away slightly,
profile view of jacket
\`\`\`
**适用**：突出剪裁、显瘦

## 姿势 3：双手插兜行走（动态街拍）
\`\`\`
1boy, walking towards camera,
both hands in jacket pockets,
mid-stride, dynamic movement,
slight smile, candid moment
\`\`\`
**适用**：短视频封面、街拍感

## 姿势 4：转身回眸（情绪化）
\`\`\`
1boy, turning back to look over shoulder,
body 3/4 turned away,
head turned to camera,
mysterious expression,
jacket back detail visible
\`\`\`
**适用**：展示背部设计、情绪大片

## 姿势 5：蹲坐姿态（生活化）
\`\`\`
1boy, crouching on one knee,
elbow resting on knee,
looking at camera,
urban street setting,
casual relaxed vibe
\`\`\`
**适用**：年轻潮流风

## 姿势 6：插兜靠墙（酷感）
\`\`\`
1boy, leaning against brick wall,
one foot up against wall,
both hands in pockets,
cool detached expression,
streetwear aesthetic
\`\`\`
**适用**：街头潮流风

## 姿势 7：拉拉链动作（功能展示）
\`\`\`
1boy, pulling up jacket zipper,
focus on hands and zipper,
mid-action shot,
showing zipper detail,
3/4 body shot
\`\`\`
**适用**：突出五金细节

## 姿势 8：戴帽子动作（连帽款专用）
\`\`\`
1boy, pulling hood up over head,
mid-motion, dynamic,
cinematic lighting,
showing hood shape and fit
\`\`\`
**适用**：连帽羽绒服展示

## ControlNet OpenPose 配合
- 使用 OpenPose editor 预设以上姿势
- 配合 depth 控制服装体积感
- 配合 canny 保留服装轮廓

## 反向提示词
\`stiff pose, unnatural, broken joints, extra fingers, deformed hands\``,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '姿势', '动作', '羽绒服', '电商'],
    isPinned: true,
    author: 'AI商拍组',
  },
  {
    title: '【男装羽绒服】多角度展示提示词',
    description: '生成男装羽绒服正面/侧面/背面/特写的多角度提示词',
    content: `你是一位电商服装拍摄专家。请为男装羽绒服生成多角度展示提示词：

【羽绒服款式】{{款式}}
【拍摄目的】{{如：详情页多角度/直播间展示/3D 旋转素材}}

请输出 6 个角度的提示词：

## 角度 1：正面全身
\`\`\`
1boy, full body front view,
standing straight, neutral pose,
{{羽绒服款式}},
showing overall silhouette,
studio lighting, white background,
commercial product photography,
8k, ultra-detailed
\`\`\`

## 角度 2：侧面全身
\`\`\`
1boy, full body side profile view,
standing straight, arms at sides,
showing jacket profile silhouette,
studio lighting, white background,
8k, ultra-detailed
\`\`\`

## 角度 3：背面全身
\`\`\`
1boy, full body back view,
standing straight, arms at sides,
showing back design and seams,
studio lighting, white background,
8k, ultra-detailed
\`\`\`

## 角度 4：45 度前侧
\`\`\`
1boy, 3/4 front angle view,
slight turn, natural stance,
showing depth and dimension,
studio lighting, white background,
8k, ultra-detailed
\`\`\`

## 角度 5：领口/帽子特写
\`\`\`
close-up shot of jacket collar/hood,
showing fur trim, stitching detail,
fabric texture visible,
professional product photography,
macro lens, shallow depth of field,
8k, ultra-detailed
\`\`\`

## 角度 6：拉链/口袋特写
\`\`\`
close-up shot of jacket zipper and pocket,
showing hardware detail, brand logo,
fabric texture, stitching quality,
macro product photography,
8k, ultra-detailed
\`\`\`

## 一致性技巧（同模特多角度）
1. **种子锁定**：使用相同 seed 值
2. **IP-Adapter**：固定模特脸 + 服装
3. **LoRA**：训练专属模特 LoRA
4. **ControlNet**：使用多角度 OpenPose 预设

## 批量生成参数（ComfyUI）
- 工作流：批量队列 → 6 个角度
- 同 seed 不同 prompt
- 总耗时：约 6-10 分钟

## 反向提示词
\`low quality, blurry, distorted, asymmetrical, bad proportions\``,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '多角度', '羽绒服', '电商'],
    author: 'AI商拍组',
  },
  {
    title: '【男装羽绒服】同模特多套换装',
    description: '保持模特一致性的前提下，生成多套羽绒服换装图',
    content: `你是 AI 模特一致性专家。请生成「同模特多套羽绒服换装」工作流：

【模特参考】{{描述模特，如：亚洲男性，短发，瘦削}}
【羽绒服款式 1】{{款式 1}}
【羽绒服款式 2】{{款式 2}}
【羽绒服款式 3】{{款式 3}}
【场景】{{场景}}
【AI 工具】{{ComfyUI / Midjourney / 即梦}}

请输出完整工作流：

## 方法 1：ComfyUI + IP-Adapter（推荐，一致性最强）

### 工作流节点
1. **Load Model**：realisticVisionV60 + IP-Adapter
2. **FaceID**：加载模特脸图，weight 0.7-0.8
3. **Reference**：服装参考图，weight 0.6-0.7
4. **OpenPose**：固定姿势
5. **KSampler**：seed 锁定（同 seed）

### 提示词模板
\`\`\`
1boy, [FACE_REFERENCE], same person,
wearing {{羽绒服款式}},
[POSE_REFERENCE],
{{场景描述}},
8k, ultra-detailed, photorealistic
\`\`\`

### 关键参数
- IP-Adapter FaceID weight: 0.75
- IP-Adapter Reference weight: 0.65
- Denoising: 0.5（保留更多一致性）
- Steps: 30, CFG: 7

## 方法 2：Midjourney + Character Reference

### 提示词
\`\`\`
1boy, wearing {{羽绒服款式 1}},
{{场景描述}},
photorealistic, 8k --cref [模特图URL] --cw 100
\`\`\`

### 参数说明
- \`--cref\`：角色参考（V6 新功能）
- \`--cw 100\`：保持脸部+服装+发型
- \`--cw 0\`：仅保持脸部（用于换装）

## 方法 3：即梦/可灵 国产工具

### 工作流
1. 上传模特图作为参考
2. 上传服装图作为参考
3. 输入提示词：保持人物一致性，换装为 [款式]
4. 选择风格：写实摄影

## 一致性检查清单
- [ ] 脸部五官一致
- [ ] 发型一致
- [ ] 体型一致
- [ ] 肤色一致
- [ ] 场景光线一致

## 常见问题排查
| 问题 | 原因 | 解决方案 |
|---|---|---|
| 脸变形 | IP-Adapter weight 过高 | 降至 0.6-0.7 |
| 服装不对 | Reference 权重过低 | 提升至 0.75 |
| 姿势僵硬 | OpenPose 过强 | 降低 weight 至 0.7 |
| 风格漂移 | seed 未锁定 | 锁定 seed |

## 输出建议
- 同模特 × 3 套服装 = 3 张图
- 加上不同姿势 × 2 = 6 张图
- 适合详情页"多色多角度展示"模块`,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '一致性', '换装', '羽绒服', '电商'],
    isPinned: true,
    author: 'AI商拍组',
  },
  {
    title: '【男装羽绒服】颜色变体批量生成',
    description: '同款不同色羽绒服的批量生成提示词工作流',
    content: `你是一位 AI 服装电商批量出图专家。请生成「羽绒服颜色变体」工作流：

【基础款式】{{款式描述，如：男士中长款连帽羽绒服}}
【目标颜色 1】{{颜色 1，如：经典黑}}
【目标颜色 2】{{颜色 2，如：军绿}}
【目标颜色 3】{{颜色 3，如：藏青}}
【目标颜色 4】{{颜色 4，如：奶白}}
【目标颜色 5】{{颜色 5，如：酒红}}

请输出颜色变体批量生成方案：

## 方法 1：ComfyUI 批量出图

### 工作流
1. 加载基础模特图
2. Inpainting 选中服装区域
3. 提示词只修改颜色关键词
4. 批量队列 5 次运行

### 提示词模板
\`\`\`
1boy, wearing {{款式}} in {{COLOR}},
same model, same pose, same background,
studio lighting, white background,
8k, ultra-detailed, photorealistic
\`\`\`

### 关键参数
- Inpainting 模式：仅重绘服装 mask 区域
- Denoising: 0.85（颜色改变彻底）
- IP-Adapter: 保持模特脸 + 服装款式
- 种子：同 seed（保一致性）

## 方法 2：Midjourney + --sref

### 提示词
\`\`\`
1boy, wearing {{款式}} in {{COLOR}},
studio shot, white background --sref [基础图URL] --sw 1000
\`\`\`

### 参数说明
- \`--sref\`：风格参考（保持整体调性）
- \`--sw 1000\`：风格权重最高

## 方法 3：Photoshop Generative Fill

### 流程
1. PS 打开原图
2. 选择 → 选中服装区域
3. Generative Fill 输入："change jacket color to {{color}}"
4. 生成 3 个变体，选最佳

## 颜色提示词对照表

| 中文颜色 | 英文 Prompt | 适合人群 |
|---|---|---|
| 经典黑 | black, jet black | 通用 |
| 军绿 | olive green, military green | 户外/工装 |
| 藏青 | navy blue | 商务 |
| 奶白 | cream white, off-white | 文艺 |
| 酒红 | burgundy, wine red | 高端 |
| 卡其 | khaki, beige | 休闲 |
| 雾霾蓝 | dusty blue, slate blue | 文艺 |
| 焦糖 | caramel, butterscotch | 复古 |

## 颜色还原注意
- 不同显示器色差问题
- AI 生成色与实物色卡对比
- 建议生成色卡图供客服参考
- 评价中"色差"问题的预防

## 批量任务规划
- 1 个款式 × 5 个颜色 = 5 张图
- 1 个款式 × 5 色 × 3 角度 = 15 张图
- 单张出图时间：30-60 秒
- 总耗时：约 10-15 分钟`,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '颜色', '批量', '羽绒服', '电商'],
    author: 'AI商拍组',
  },
  {
    title: '【男装羽绒服】细节特写提示词',
    description: '羽绒服面料、五金、缝线等细节特写提示词',
    content: `你是一位商业产品摄影师。请为男装羽绒服生成细节特写提示词：

【羽绒服款式】{{款式}}
【需要突出的细节】{{如：拉链/帽子/口袋/缝线/面料}}

请输出 6 个细节特写提示词：

## 特写 1：面料纹理
\`\`\`
extreme close-up of down jacket fabric,
showing ripstop nylon texture,
water droplet beads on surface,
DWR coating visible,
soft studio lighting,
macro lens, shallow depth of field,
8k, ultra-detailed, product photography
\`\`\`

## 特写 2：拉链五金
\`\`\`
close-up of jacket zipper,
YKK metal zipper, brushed finish,
zipper pull with brand logo,
showing teeth detail and stitching,
professional product photography,
macro lens, 100mm f/2.8,
8k, ultra-detailed
\`\`\`

## 特写 3：缝线工艺
\`\`\`
close-up of jacket seam stitching,
showing even stitch pattern,
reinforced stress points,
contrast thread color,
showing craftsmanship quality,
macro photography,
8k, ultra-detailed
\`\`\`

## 特写 4：蓬松度展示
\`\`\`
close-up of down jacket puffy section,
showing loft and insulation,
compressed vs expanded comparison,
showing premium down fill quality,
studio lighting, white background,
8k, ultra-detailed
\`\`\`

## 特写 5：帽子毛领
\`\`\`
close-up of jacket hood with fur trim,
natural raccoon fur trim,
showing fur texture and volume,
premium quality detail,
luxury product photography,
8k, ultra-detailed
\`\`\`

## 特写 6：口袋/抽绳
\`\`\`
close-up of jacket pocket and drawstring,
showing pocket opening detail,
cord stopper hardware,
functional design elements,
product photography,
8k, ultra-detailed
\`\`\`

## 反向提示词
\`blurry, low quality, fake, plastic, cheap looking, noisy\`

## 拍摄技巧
- 微距镜头（100mm f/2.8 macro）
- 柔光箱（避免硬光反光）
- 三脚架 + 快门线（防抖）
- 焦点堆叠（提高景深）
- 后期：锐化 + 去噪

## 电商应用
- 详情页"品质工艺"模块
- 主图第 2-3 张（卖点图）
- 短视频开场镜头
- 客服解释工艺的素材`,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '细节', '特写', '羽绒服', '电商'],
    author: 'AI商拍组',
  },
  {
    title: '【男装羽绒服】电商白底主图提示词',
    description: '专为电商白底主图设计的男装羽绒服提示词',
    content: `你是一位电商白底主图专家。请为男装羽绒服生成符合各平台规范的提示词：

【羽绒服款式】{{款式}}
【目标平台】{{淘宝/天猫/京东/抖音/拼多多}}
【主图规范】{{如：800×800 / 1200×1200 / 白底}}

请输出电商白底主图提示词：

## 标准白底主图提示词
\`\`\`
1boy, male model wearing {{羽绒服款式}},
standing front view, full body centered,
pure white background (#FFFFFF),
studio lighting, soft even illumination,
no shadow on background,
commercial e-commerce product photography,
symmetrical composition, garment fully visible,
shot on Canon EOS R5, 85mm f/8,
8k, ultra-detailed, photorealistic
\`\`\`

## 反向提示词
\`shadow, background pattern, watermark, text, logo, cropped, off-center, asymmetric, busy background, props, furniture\`

## 各平台规范

### 淘宝/天猫主图
- 尺寸：800×800（最小）或 1200×1200（推荐）
- 比例：1:1
- 背景：纯白（必填）
- 主体：占图 60-80%
- 文字：第 1 张不可有，2-5 张可有

### 京东主图
- 尺寸：800×800 或 1200×1200
- 背景：纯白
- 风格：更简洁，少文字
- 第 1 张：必须白底无文字

### 抖音商城
- 尺寸：1:1 或 3:4
- 风格：可生活化、有场景
- 第 1 张：建议白底或简洁背景

### 拼多多
- 尺寸：750×750
- 背景：纯白
- 风格：突出性价比

## ComfyUI 工作流推荐

### 节点配置
1. Load Checkpoint: realisticVisionV60
2. CLIP Text Encode (正向/反向)
3. Empty Latent: 1024×1024
4. KSampler: steps 35, cfg 7, dpmpp_2m
5. Upscale: 4x-UltraSharp, 0.4 denoise
6. Save Image: PNG（无损）

### 后期处理（PS）
1. 抠图（选择主体 + 羽化）
2. 纯白背景填充
3. 调色（与实物色卡对比）
4. 加阴影（地面接触阴影，增强立体感）
5. 锐化（USM 锐化，半径 1.0）

## 主图 5 张结构建议
1. 第 1 张：白底正面全身（必填白底）
2. 第 2 张：卖点图 1（面料/防水）
3. 第 3 张：卖点图 2（蓬松度/保暖）
4. 第 4 张：场景图（街拍/雪景）
5. 第 5 张：促销图（利益点）

## 一键批量生成
- ComfyUI 队列：5 张主图 + 5 个角度
- 同一模特 + 同款服装
- 总耗时：约 5 分钟`,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '白底', '主图', '羽绒服', '电商'],
    isPinned: true,
    author: 'AI商拍组',
  },
  {
    title: '【男装羽绒服】直播间场景图',
    description: '生成适合直播间背景的羽绒服场景图提示词',
    content: `你是一位电商直播间视觉设计师。请为男装羽绒服直播间生成背景场景提示词：

【直播间风格】{{如：高端简约/潮流街头/温暖治愈}}
【羽绒服主推色】{{主色}}
【直播间尺寸】{{如：9:16 竖屏 / 16:9 横屏}}
【品牌调性】{{如：高端商务/年轻潮流/户外机能}}

请输出 4 种直播间背景方案：

## 方案 1：极简白调（高端商务）
\`\`\`
minimalist white studio background,
clean concrete floor,
single modern chair as prop,
soft diffused lighting,
large window with natural light,
Scandinavian interior design,
no clutter, premium feel,
8k, ultra-detailed, architectural photography
\`\`\`
**适合**：商务高端品牌
**搭配模特**：成熟男性，正装内搭

## 方案 2：城市街头（潮流年轻）
\`\`\`
urban loft background,
exposed brick wall,
industrial metal shelves,
neon sign accents,
concrete floor,
graffiti art on wall,
streetwear store aesthetic,
moody cinematic lighting,
8k, ultra-detailed
\`\`\`
**适合**：街头潮流品牌
**搭配模特**：年轻潮流男性

## 方案 3：山林雪景（户外机能）
\`\`\`
mountain cabin interior background,
wooden wall, antler decor,
stone fireplace with fire,
plaid wool blanket,
warm cozy lighting,
winter lodge aesthetic,
Patagonia / Arc'teryx brand vibe,
8k, ultra-detailed
\`\`\`
**适合**：户外机能品牌
**搭配模特**：运动健壮型男

## 方案 4：温暖家居（日常实穿）
\`\`\`
modern living room background,
beige sofa, wooden floor,
indoor plants,
warm afternoon light,
cozy home atmosphere,
Muji / Ikea catalog style,
8k, ultra-detailed
\`\`\`
**适合**：日常休闲品牌
**搭配模特**：亲和力强的模特

## 反向提示词
\`cluttered, messy, text, watermark, low quality, blurry, people in background\`

## 直播间使用建议
1. **生成尺寸**：1280×720（横屏）或 720×1280（竖屏）
2. **抠图处理**：将 AI 生成的背景作为绿幕素材
3. **直播叠加**：OBS 中作为背景层 + 真人模特前景
4. **场景切换**：不同 SKU 配不同背景

## 直播间视觉规范
- 主体（模特）占画面 50-60%
- 背景不能抢戏
- 留出左侧 1/4 空间放商品信息
- 留出底部 1/6 空间放价格/利益点
- 字体大、对比强，远距离可读

## 工具推荐
- **Midjourney**：生成背景（--ar 16:9 或 --ar 9:16）
- **Stable Diffusion**：批量生成 + 风格统一
- **即梦/可灵**：国产替代
- **OBS**：直播叠加
- **剪映**：直播切片后期`,
    categoryName: '男装羽绒服',
    tags: ['AI模特', '直播间', '场景', '羽绒服', '电商'],
    author: 'AI商拍组',
  },

  // ============ AI 模特商拍 - 通用换装 ============
  {
    title: '通用 AI 模特换装工作流',
    description: '适用于所有服装类目的 AI 换装通用工作流',
    content: `你是一位 AI 服装商拍工作流专家。请输出通用 AI 模特换装工作流：

【服装类型】{{如：T恤/外套/裙装/裤装}}
【服装图】{{平铺图/挂拍图/人台图}}
【模特要求】{{性别/年龄/体型/风格}}
【AI 工具】{{ComfyUI / Midjourney / 即梦 / 堆友}}

请输出通用换装工作流：

## 工具选择矩阵

| 工具 | 优势 | 劣势 | 适用场景 |
|---|---|---|---|
| ComfyUI + IP-Adapter | 一致性最强，可定制 | 学习门槛高 | 批量出图、专业团队 |
| Midjourney + --cref | 出图质量高，简单 | 一致性中等 | 单图高质量 |
| 即梦 AI 试衣 | 中文友好，免费 | 风格有限 | 快速出图 |
| 堆友 AI 换肤 | 国产，操作简单 | 模板化 | 新手入门 |
| 阿里 ManekenAI | 工业级，API 可调 | 需企业认证 | 大规模商用 |

## ComfyUI 标准工作流

### 必备节点
1. **Load Checkpoint**：realisticVisionV60 / majicMIX
2. **Load IP-Adapter**：plus 版本
3. **Load ControlNet**：OpenPose + Depth
4. **Load LoRA**（可选）：服装细节 / 模特脸

### 工作流结构
\`\`\`
[服装图] → IP-Adapter Reference
[模特图] → IP-Adapter FaceID
[姿势图] → ControlNet OpenPose
         ↓
      KSampler
         ↓
      VAE Decode
         ↓
      Upscale (4x)
         ↓
      Save Image
\`\`\`

### 参数推荐
- IP-Adapter Reference weight: 0.65-0.75
- IP-Adapter FaceID weight: 0.7-0.8
- ControlNet weight: 0.7-0.85
- Denoising: 0.55-0.7
- Steps: 30, CFG: 7
- Sampler: dpmpp_2m_karras

## 提示词模板
\`\`\`
1boy/girl, [参考脸], wearing [参考服装],
[姿势描述], [场景描述],
8k, ultra-detailed, photorealistic,
commercial fashion photography
\`\`\`

## 反向提示词（通用）
\`\`\`
ugly, deformed, bad anatomy, extra fingers,
blurry, lowres, watermark, text, logo,
distorted face, unnatural pose, plastic skin,
bad proportions, mutated hands
\`\`\`

## 5 大常见问题与解决方案

### 1. 服装细节丢失
**原因**：IP-Adapter 权重过低
**解决**：提升至 0.75，或加服装 LoRA

### 2. 模特脸变形
**原因**：FaceID 权重过高
**解决**：降至 0.6-0.7，加 denoise 0.5

### 3. 姿势不自然
**原因**：ControlNet 过强
**解决**：weight 0.7，加 canny 辅助

### 4. 服装色差
**原因**：模型色域限制
**解决**：后期 PS 调色，对照色卡

### 5. 手部畸形
**原因**：模型手部训练不足
**解决**：加 hand LoRA，或 Inpainting 修手

## 成本与效率
- ComfyUI 本地部署：免费（需显卡 RTX 3060+）
- 云端 ComfyUI（如 LiblibAI）：约 0.5-2 元/张
- 即梦/堆友：免费或会员制
- 阿里 ManekenAPI：约 0.3-0.8 元/张`,
    categoryName: '通用换装',
    tags: ['AI模特', '换装', '工作流', '电商'],
    isPinned: true,
    author: 'AI商拍组',
  },
  {
    title: '虚拟试衣提示词（用户上传）',
    description: '用户上传自己照片，生成服装上身效果',
    content: `你是虚拟试衣提示词专家。请为用户上传照片生成试衣提示词：

【用户照片类型】{{如：自拍/全身照/半身照}}
【目标服装】{{服装描述}}
【场景】{{如：保持原图场景/换为白底/换为街拍}}

请输出虚拟试衣工作流：

## 方法 1：ComfyUI Inpainting 工作流

### 流程
1. 用户上传照片
2. 自动抠出人物 + 服装区域 mask
3. 输入新服装参考图
4. Inpainting 重绘服装区域
5. 输出新图

### 提示词
\`\`\`
1person, wearing {{新服装描述}},
keeping original face and body,
same background as original,
natural lighting, photorealistic,
8k, ultra-detailed
\`\`\`

### 关键参数
- Denoising: 0.75（彻底换装）
- Mask blur: 4（边缘自然过渡）
- IP-Adapter: 服装参考 weight 0.7

## 方法 2：Midjourney --cref + --cw 0

### 提示词
\`\`\`
person wearing {{新服装}},
{{场景}} --cref [用户图URL] --cw 0
\`\`\`

### 参数说明
- \`--cref\`：人物参考
- \`--cw 0\`：仅保脸，可换装

## 方法 3：国产工具一键试衣

### 即梦 AI 试衣
1. 上传模特图（用户）
2. 上传服装图
3. 一键生成

### 阿里 AI 试衣
1. 选择模特或上传
2. 选择服装
3. 生成试穿图

## 隐私与合规
- 用户照片仅本地处理，不上传
- 提示用户授权使用
- 未成年人保护
- 不支持换脸（防深伪）

## 适用场景
- 服装电商"试穿"功能
- 用户评价生成
- 个性化推荐
- 直播间互动`,
    categoryName: '通用换装',
    tags: ['AI模特', '虚拟试衣', '电商'],
    author: 'AI商拍组',
  },

  // ============ AI 模特商拍 - 场景生成 ============
  {
    title: '服装拍摄场景 AI 生成',
    description: '生成各类服装拍摄背景场景的 AI 提示词',
    content: `你是一位 AI 场景设计师。请为服装商拍生成各类场景提示词：

【服装类型】{{服装类型}}
【风格调性】{{如：简约/复古/未来感/自然}}
【目标人群】{{目标人群}}
【季节】{{季节}}

请输出 8 类常用场景提示词：

## 场景 1：纯色背景（基础电商）
\`\`\`
solid color background, {{color}} backdrop,
seamless paper background,
soft studio lighting,
no props, minimalist,
product photography setting,
8k, ultra-detailed
\`\`\`

## 场景 2：水泥工业风
\`\`\`
concrete wall background,
industrial loft interior,
exposed pipes, metal shelves,
moody cinematic lighting,
urban brutalist aesthetic,
8k, ultra-detailed
\`\`\`

## 场景 3：北欧极简
\`\`\`
Scandinavian interior,
white walls, light wood floor,
minimal furniture, single plant,
soft natural daylight,
Ikea catalog aesthetic,
8k, ultra-detailed
\`\`\`

## 场景 4：复古咖啡馆
\`\`\`
vintage coffee shop interior,
exposed brick wall, wooden counter,
warm Edison bulb lighting,
cozy atmosphere, hygge style,
film photography aesthetic,
8k, ultra-detailed
\`\`\`

## 场景 5：户外自然
\`\`\`
outdoor nature background,
forest path, dappled sunlight,
golden hour, lens flare,
bokeh background, candid moment,
lifestyle photography,
8k, ultra-detailed
\`\`\`

## 场景 6：城市夜景
\`\`\`
city street at night,
neon lights, rainy reflection,
bokeh city lights,
cyberpunk aesthetic,
cinematic moody lighting,
8k, ultra-detailed
\`\`\`

## 场景 7：海边沙滩
\`\`\`
tropical beach background,
white sand, turquoise water,
palm trees, golden hour,
summer vacation vibe,
travel photography,
8k, ultra-detailed
\`\`\`

## 场景 8：未来科技感
\`\`\`
futuristic sci-fi interior,
holographic panels, neon accents,
metallic surfaces, glass walls,
cyberpunk lighting,
Blade Runner aesthetic,
8k, ultra-detailed
\`\`\`

## 反向提示词
\`people in background, text, watermark, low quality, cluttered, messy\`

## 使用技巧
- 场景作为背景，主体（服装/模特）为前景
- 使用 Inpainting 仅生成背景区域
- 保持主体清晰，背景适度虚化
- 同一场景可复用多个 SKU

## 季节性场景推荐
- 春：花海、樱花、嫩绿草地
- 夏：海边、泳池、热带
- 秋：枫叶、稻田、暖阳
- 冬：雪景、暖光、咖啡馆`,
    categoryName: '场景生成',
    tags: ['AI模特', '场景', '背景', '电商'],
    author: 'AI商拍组',
  },

  // ============ AI 模特商拍 - 姿势动作 ============
  {
    title: '电商模特姿势库',
    description: '电商服装模特常用姿势的完整提示词库',
    content: `你是一位电商模特姿势设计专家。请输出电商服装模特姿势库：

【服装类型】{{服装类型}}
【模特性别】{{性别}}
【拍摄目的】{{如：主图/详情页/短视频}}

请输出 12 个电商常用姿势：

## 站姿类

### 姿势 1：标准站姿（基础展示）
\`\`\`
standing front view, full body,
arms relaxed at sides,
weight evenly distributed,
looking at camera,
neutral expression
\`\`\`

### 姿势 2：单手插兜（休闲酷感）
\`\`\`
standing 45-degree angle,
one hand in pocket,
other hand relaxed,
slight head tilt,
confident expression
\`\`\`

### 姿势 3：双手插兜（街头风）
\`\`\`
standing front view,
both hands in pockets,
shoulders relaxed,
slight lean forward,
cool expression
\`\`\`

### 姿势 4：交叉双手（高冷）
\`\`\`
standing front view,
arms crossed over chest,
serious expression,
power pose
\`\`\`

## 动态类

### 姿势 5：行走（动态街拍）
\`\`\`
walking towards camera,
mid-stride, dynamic movement,
arms swinging naturally,
candid moment
\`\`\`

### 姿势 6：转身回眸（情绪化）
\`\`\`
turning back, looking over shoulder,
body 3/4 turned away,
head turned to camera,
mysterious expression
\`\`\`

### 姿势 7：跳跃（活力）
\`\`\`
mid-jump, legs bent,
arms raised, joyful expression,
dynamic action shot,
energetic vibe
\`\`\`

## 坐姿类

### 姿势 8：坐椅子（休闲）
\`\`\`
sitting on chair, legs crossed,
one hand on knee, other on armrest,
relaxed confident posture
\`\`\`

### 姿势 9：席地而坐（随性）
\`\`\`
sitting on floor, legs crossed,
hands on knees, casual,
bohemian aesthetic
\`\`\`

### 姿势 10：靠墙（酷感）
\`\`\`
leaning against wall,
one foot up against wall,
arms crossed or in pockets,
streetwear aesthetic
\`\`\`

## 特殊类

### 姿势 11：蹲姿（潮流）
\`\`\`
crouching on one knee,
elbow on knee, looking at camera,
urban street setting,
hip-hop aesthetic
\`\`\`

### 姿势 12：动作展示（功能性）
\`\`\`
demonstrating product feature,
mid-action (zipping, buttoning),
focus on hands and product,
3/4 body shot
\`\`\`

## ControlNet OpenPose 配合

### 推荐预设
- basic_05 standing poses
- basic_12 sitting poses
- dynamic_03 action poses
- portrait_08 fashion poses

### 使用技巧
- 调整 weight: 0.7-0.85
- 配合 Depth 增强体积感
- 配合 Canny 保留轮廓

## 反向提示词
\`stiff, unnatural, broken joints, extra fingers, deformed hands, bad pose\`

## 姿势选择建议
- 主图：姿势 1 / 2（标准）
- 详情页：姿势 1-4 + 8-10（多角度）
- 短视频封面：姿势 5-7（动态）
- 街拍感：姿势 3 / 6 / 10
- 高端品牌：姿势 4 / 8`,
    categoryName: '姿势动作',
    tags: ['AI模特', '姿势', '动作', '电商'],
    author: 'AI商拍组',
  },

  // ============ AI 短剧 - 剧本创作 ============
  {
    title: 'AI 短剧剧本创作',
    description: '生成完整的短剧剧本（含人物、场景、对白）',
    content: `你是一位资深短剧编剧。请根据以下要求创作短剧剧本：

【短剧类型】{{如：霸总/逆袭/穿越/重生/古言/悬疑}}
【集数】{{如：5 集 / 10 集 / 20 集}}
【单集时长】{{如：1-2 分钟}}
【主角设定】{{主角姓名、身份、性格}}
【核心冲突】{{核心冲突}}
【目标观众】{{如：30+ 女性/下沉市场}}

请输出完整剧本：

## 一、剧集信息
- 剧名（3 个备选）
- 类型标签
- 集数 + 单集时长
- 预估总时长

## 二、人物小传
### 主角（1-2 人）
- 姓名、年龄、身份、外貌
- 性格特征、说话风格
- 成长弧光（从什么变成什么）

### 配角（3-5 人）
- 简要设定 + 功能定位

## 三、故事大纲
### 整体结构（3 幕）
- 起：故事起点，主角的日常 + 打破日常的事件
- 承：冲突升级，主角挣扎
- 转：转折点，主角觉醒
- 合：高潮 + 结局

### 集数拆解
每集 50-80 字梗概，含：
- 本集开场钩子（前 3 秒）
- 主要冲突
- 集末悬念（让观众想看下一集）

## 四、第 1 集完整剧本（示范）

### 场景 1（开场）
- 场景描述（时间/地点/氛围）
- 人物出场
- 对白（控制在 5-8 句）
- 动作/表情提示

### 场景 2-5
- 同上结构
- 每场 30-60 秒

### 集末钩子
- 悬念设计

## 五、爆款元素清单
- [ ] 强冲突开场（前 3 秒抓住眼球）
- [ ] 反转 + 反转 + 反转
- [ ] 情绪节点密集
- [ ] 主角"金手指"或逆袭爽点
- [ ] 集末必留悬念
- [ ] 适度"狗血"满足代入

## 六、平台适配建议
- 抖音/快手：节奏更快，每 10 秒一个钩子
- 视频号：情感共鸣更强
- B 站：可稍长，剧情更复杂`,
    categoryName: '剧本创作',
    tags: ['AI短剧', '剧本', '创作'],
    isPinned: true,
    author: 'AI短剧组',
  },
  {
    title: '短剧爆款开头模板',
    description: '生成前 3 秒抓住观众的爆款开头',
    content: `你是一位短剧爆款开头设计专家。请生成多种类型的爆款开头：

【短剧类型】{{类型}}
【主角身份】{{主角身份}}
【核心冲突】{{核心冲突}}

请输出 8 种爆款开头模板，每种含具体剧本：

## 类型 1：反差冲突型
**模板**：「光明正大的场合 + 突然撕破脸」
**示例剧本**：
> 婚礼现场，新娘（女主）穿着婚纱，走到麦克风前：
> "感谢各位来参加我的婚礼。但在宣誓前，我有一段视频要播放。"
> 大屏幕上，新郎与伴娘在酒店房间的画面。全场哗然。

## 类型 2：身份揭秘型
**模板**：「看似卑微的人 + 暗藏显赫身份」
**示例剧本**：
> 总裁办公室。女主（保洁员）正在擦地。
> 总裁路过，不屑地："把这地擦干净点。"
> 女主低头应是。镜头一转，她手机屏幕：「林氏集团董事局主席」来电。

## 类型 3：重生穿越型
**模板**：「死亡瞬间 + 重生到过去」
**示例剧本**：
> 女主被推下天台，坠落中。
> 画外音："如果能重来一次，我绝不会再爱他。"
> 睁眼，回到 5 年前。她看着熟悉的卧室，握紧拳头。

## 类型 4：误会羞辱型
**模板**：「被冤枉 + 受尽羞辱 + 真相大白预告」
**示例剧本**：
> 家宴。婆婆摔碎花瓶，指着女主："是你偷的吧！"
> 全家人指指点点。女主含泪。
> 门外，刚到的男主看到监控画面：是婆婆自己摔的。

## 类型 5：逆袭打脸型
**模板**：「被欺负 + 5 秒后强势反击」
**示例剧本**：
> 同学聚会。昔日同桌嘲讽女主："听说你现在送外卖？"
> 女主笑笑。门外，助理进门："总裁，董事会等您。"
> 全场石化。

## 类型 6：死亡倒计时型
**模板**：「被告知剩余生命 + 决定改写人生」
**示例剧本**：
> 医院走廊。医生："您还有 30 天。"
> 女主看天，回忆被丈夫和小三欺压的画面。
> 她："那这 30 天，我要让你们付出代价。"

## 类型 7：神秘契约型
**模板**：「陌生人 + 提出无法拒绝的交易」
**示例剧本**：
> 雨夜。黑伞男递给女主一份合同："签了，你就能复仇。"
> 女主犹豫。男人："你妹妹还在医院等医药费。"
> 女主颤抖签字。

## 类型 8：错认身份型
**模板**：「被错认成某人 + 顺势而为」
**示例剧本**：
> 豪车前，管家鞠躬："小姐，老爷请您回家。"
> 女主："你认错人了。"
> 管家："您的胎记，和老爷失散的女儿一模一样。"
> 女主摸了摸手腕上的胎记。

## 爆款开头通用原则
1. **前 3 秒必须有强冲突**：不要铺垫，直接给刺激
2. **视觉冲击**：婚宴/葬礼/医院/天台等戏剧化场景
3. **对白要狠**：直白、有杀气、不绕弯
4. **悬念在前 5 秒抛出**：让观众想看接下来
5. **避免内心独白**：用动作和对白推进

## 数据参考
- 抖音短剧前 3 秒完播率 < 60% 基本凉了
- 前 15 秒决定 80% 完播率
- 集末 5 秒决定下一集点击率`,
    categoryName: '剧本创作',
    tags: ['AI短剧', '开头', '爆款'],
    author: 'AI短剧组',
  },
  {
    title: '短剧人物小传生成',
    description: '生成丰满的短剧人物小传，含性格、背景、说话方式',
    content: `你是短剧角色设计专家。请生成完整的人物小传：

【人物姓名】{{姓名}}
【身份定位】{{如：女主/男主/反派/配角}}
【短剧类型】{{如：霸总/古言/穿越}}
【核心需求】{{这个人物在剧中要承担什么功能}}

请输出完整人物小传：

## 一、基本信息
- 姓名（含小名/外号）
- 年龄
- 身份（公开身份 vs 真实身份）
- 外貌（身高/发型/着装风格/标志性特征）
- 学历/职业背景

## 二、性格画像
### 表面性格（他人眼中的 TA）
3-5 个形容词

### 真实性格（独处时的 TA）
3-5 个形容词（与表面形成反差）

### 性格成因
- 原生家庭
- 关键成长事件
- 重要他人影响

## 三、说话风格
### 用词习惯
- 偏书面 / 偏口语
- 喜欢用的词 / 讨厌的词
- 口头禅（2-3 句）

### 表达特点
- 直接 vs 委婉
- 情绪化 vs 理性
- 简短 vs 啰嗦

### 经典台词示例
3-5 句符合人物的对白

## 四、行为模式
### 面对冲突时
（具体行为描述）

### 面对爱人时
（具体行为描述）

### 面对敌人时
（具体行为描述）

### 独处时
（具体行为描述）

## 五、价值观与执念
- 最看重的（3 项排序）
- 最讨厌的（3 项）
- 执念（驱动 TA 行动的核心）
- 软肋（一击必中的弱点）

## 六、关键道具/标记
- 随身物品（暗示身份或记忆）
- 身体标记（胎记/疤痕/纹身）
- 习惯动作

## 七、人物关系网
- 与其他主要人物的关系
- 关系中的张力点

## 八、成长弧光
- 起点：开始时的状态
- 转折：什么事件改变了 TA
- 终点：最终成为什么样的人

## 九、AI 生成一致性参考图（提示词）
为该角色生成 SD/MJ 提示词，保证后续画面一致性：
\`\`\`
1boy/girl, {{年龄}} years old, {{种族}},
{{发型}}, {{眼睛颜色}}, {{肤色}},
wearing {{日常着装}},
{{性格外化表情}},
photorealistic, 8k, ultra-detailed
\`\`\``,
    categoryName: '剧本创作',
    tags: ['AI短剧', '人物', '小传'],
    author: 'AI短剧组',
  },

  // ============ AI 短剧 - 分镜设计 ============
  {
    title: 'AI 短剧分镜脚本生成',
    description: '将剧本拆解为分镜脚本（含画面描述、镜头、对白）',
    content: `你是一位 AI 短剧分镜师。请将以下剧本拆解为分镜脚本：

【剧本片段】
{{粘贴剧本片段}}

【单集时长】{{如：90 秒}}
【风格】{{如：电影感/网感快剪/纪录风}}
【AI 工具】{{如：即梦/可灵/Midjourney + Runway}}

请输出标准分镜脚本：

## 分镜脚本表格

| 镜号 | 时长 | 场景 | 镜头 | 画面描述 | 对白/旁白 | 音效/BGM | AI 提示词 |
|---|---|---|---|---|---|---|---|

每个镜头包含：

### 镜号 1（0-3 秒）
- **场景**：医院走廊，雨天
- **镜头**：中景，女主背影，缓慢推进
- **画面描述**：女主穿着病号服，缓缓走向手术室。窗外暴雨如注。
- **对白**：（无对白，仅环境音）
- **音效**：雨声 + 心跳声渐强
- **AI 提示词**：
  \`\`\`
  wide shot, hospital corridor,
  woman in hospital gown walking away,
  rainstorm outside window, moody lighting,
  cinematic, slow dolly in,
  8k, ultra-detailed, film still
  \`\`\`

### 镜号 2（3-6 秒）
... (按此格式继续)

## 分镜原则
1. **每镜不超过 5 秒**：网感节奏，避免拖沓
2. **前 3 秒必有强画面**：抓住眼球
3. **镜头变化丰富**：远景/中景/近景/特写交替
4. **运动镜头为主**：推进/拉远/横移/跟随
5. **对白与画面错位**：避免"对口型"呆板感

## AI 提示词撰写要点
1. **英文为主**：MJ/SD 用英文，即梦/可灵用中文
2. **结构化**：主体 + 动作 + 场景 + 光线 + 镜头 + 画质
3. **风格统一**：全片用同一组风格关键词
4. **角色一致**：使用 --cref 或 IP-Adapter
5. **画面比例**：竖屏 9:16（--ar 9:16）

## 镜头语言参考
- **景别**：远景/全景/中景/近景/特写/大特写
- **角度**：平视/俯视/仰视/鸟瞰
- **运动**：固定/推/拉/摇/移/跟/升降
- **焦点**：实焦/虚焦/焦点转换

## 节奏控制
- 紧张段落：每镜 1-2 秒，快剪
- 抒情段落：每镜 3-5 秒，慢镜
- 高潮段落：节奏由慢到快

## 输出建议
- 单集 30-50 个镜头
- 每镜 1 张分镜图
- 总图量：30-50 张/集
- 生成时间：约 30-60 分钟/集`,
    categoryName: '分镜设计',
    tags: ['AI短剧', '分镜', '镜头'],
    isPinned: true,
    author: 'AI短剧组',
  },
  {
    title: '短剧人物一致性参考图',
    description: '生成短剧主要角色的固定参考图提示词',
    content: `你是 AI 短剧角色设计专家。请为主要角色生成一致性参考图提示词：

【角色 1 姓名】{{姓名 1}}
【角色 1 描述】{{年龄/性别/发型/着装风格/标志特征}}
【角色 2 姓名】{{姓名 2}}
【角色 2 描述】{{描述}}
【风格】{{如：写实/动漫/水墨/油画}}
【AI 工具】{{如：Midjourney + --cref / SD + IP-Adapter}}

请输出每个角色的：

## 角色 1：{{姓名 1}}

### 参考图提示词（正面半身标准像）
\`\`\`
1boy/girl, {{年龄}} years old, {{种族}},
{{发型描述}}, {{眼睛颜色}}, {{肤色}},
{{面部特征，如：高鼻梁/薄唇/方下颌}},
wearing {{日常着装}},
neutral expression, looking at camera,
plain background, soft studio lighting,
passport photo style,
8k, ultra-detailed, photorealistic
\`\`\`

### 多角度参考图（4 张）
1. 正面 / 2. 侧面 45 度 / 3. 侧面 90 度 / 4. 仰视
\`\`\`
same person as reference, {{角度}},
保持发型、五官、肤色一致,
8k, ultra-detailed
\`\`\`

### 多表情参考图（6 张）
1. 微笑 / 2. 大笑 / 3. 生气 / 4. 哭泣 / 5. 惊讶 / 6. 思考
\`\`\`
same person as reference, {{表情}},
保持人物特征一致,
8k, ultra-detailed
\`\`\`

### 反向提示词
\`different person, changed face, different hairstyle, makeup, accessories, aging\`

## 角色 2：{{姓名 2}}
（同上格式）

## Midjourney 一致性方案

### 方法 1：--cref（V6 角色参考）
1. 先生成一张满意的角色图
2. 后续所有该角色图加 \`--cref [图片URL] --cw 100\`
3. \`--cw 100\` 保持脸+发型+服装
4. \`--cw 0\` 仅保持脸（可换装）

### 方法 2：训练专属 LoRA
1. 收集该角色 15-30 张图（多角度/多表情）
2. 用 Kohya 训练 LoRA
3. 后续生成时加载该 LoRA

### 方法 3：SD + IP-Adapter FaceID
1. 加载角色参考图
2. IP-Adapter FaceID weight: 0.75
3. 锁定 seed

## 即梦/可灵 国产方案
1. 上传角色参考图
2. 选择"角色一致性"
3. 输入场景描述
4. 一键生成

## 检查清单
- [ ] 五官一致
- [ ] 发型一致
- [ ] 体型一致
- [ ] 肤色一致
- [ ] 标志特征（疤痕/痣/胎记）一致

## 团队协作建议
- 角色参考图保存到团队素材库
- 命名规范：项目名_角色名_角度/表情_序号
- 版本管理：v1, v2 标注
- 多人协作使用同一组参考图`,
    categoryName: '分镜设计',
    tags: ['AI短剧', '角色', '一致性'],
    author: 'AI短剧组',
  },

  // ============ AI 短剧 - 视频生成 ============
  {
    title: '图生视频 AI 工具对比与提示词',
    description: '可灵/即梦/Runway/Vidu 等图生视频工具的提示词与对比',
    content: `你是 AI 视频生成专家。请输出主流图生视频工具的对比与提示词：

【分镜图】{{分镜图描述}}
【镜头运动】{{如：缓慢推进/横移/特写拉远}}
【时长】{{如：5 秒 / 10 秒}}
【预算】{{如：免费/付费}}

请输出主流工具对比：

## 工具对比矩阵

| 工具 | 时长 | 分辨率 | 价格 | 中文 | 一致性 | 推荐场景 |
|---|---|---|---|---|---|---|
| 可灵 AI | 5-10s | 1080p | 6.6 元/个 | ✓ | 强 | 国产首选 |
| 即梦 AI | 5-12s | 1080p | 免费限次 | ✓ | 中 | 快速出片 |
| Runway Gen-3 | 10s | 1080p | $15/月 | ✗ | 强 | 海外项目 |
| Vidu | 4-8s | 720p | 免费限次 | ✓ | 中 | 国产备选 |
| 海螺 AI | 6s | 1080p | 免费限次 | ✓ | 中 | 国产备选 |
| Pika | 3-5s | 720p | $10/月 | ✗ | 弱 | 短平快 |

## 可灵 AI 提示词

### 中文提示词模板
\`\`\`
【画面描述】{{分镜画面描述}}
【镜头运动】{{如：缓慢推进/横移/拉远/固定}}
【人物动作】{{具体动作描述}}
【环境氛围】{{光线/天气/情绪}}
【时长】5 秒
【帧率】24
【质量】高清
【口型同步】开启（如有对白）
\`\`\`

### 提示词优化技巧
- 描述具体动作，避免抽象（"缓慢抬手"而非"优雅动作"）
- 加入情绪关键词（紧张/温馨/震撼）
- 指定光线（晨光/黄昏/霓虹）
- 避免复杂多人物场景

## 即梦 AI 提示词

### 中文提示词模板
\`\`\`
{{分镜画面描述}},
镜头{{运动方式}},
{{人物动作}},
{{环境氛围}},
电影级光影,
5 秒
\`\`\`

### 即梦特色功能
- 角色一致性（上传参考图）
- 运镜控制（推/拉/摇/移）
- 时长可选 5/10/12 秒
- Seedance 2.0 Fast 加速版

## Runway Gen-3 提示词（英文）

### 提示词模板
\`\`\`
{{scene description}},
camera {{movement}},
{{character action}},
{{lighting}},
cinematic, film grain,
8k, professional cinematography
\`\`\`

### Runway 特色
- Motion Brush（局部运动控制）
- Camera Control（精准运镜）
- 1080p 高清
- 长视频支持（最长 10 秒）

## 提示词撰写 5 大原则

### 1. 具体化
- ❌ "男人走路"
- ✓ "穿黑色风衣的男子在雨夜街道快步走向镜头"

### 2. 动作化
- ❌ "氛围紧张"
- ✓ "女子握紧拳头，眉头紧锁，缓慢抬头看向对方"

### 3. 镜头化
- 明确运镜：push in / pull out / pan / tilt / dolly
- 指定景别：close-up / medium / wide

### 4. 情绪化
- 加入情绪关键词：tense / warm / mysterious / epic
- 影响整体氛围

### 5. 简洁化
- 单镜提示词不超过 100 字
- 重点突出主要动作

## 生成失败排查
| 问题 | 原因 | 解决 |
|---|---|---|
| 人物变形 | 多人物复杂场景 | 拆分为单人镜头 |
| 动作不连贯 | 描述太抽象 | 具体到每个动作 |
| 画面闪烁 | 一致性不足 | 使用参考图 |
| 时长不对 | 工具限制 | 选择支持长视频的工具 |
| 口型不匹配 | 口型同步未开 | 开启 lip sync |

## 成本控制建议
- 免费额度先用尽（即梦/海螺）
- 关键镜头用可灵/Runway
- 普通镜头用免费工具
- 单集 30 镜，预算控制在 100-200 元`,
    categoryName: '视频生成',
    tags: ['AI短剧', '图生视频', '可灵', '即梦'],
    isPinned: true,
    author: 'AI短剧组',
  },
  {
    title: '短剧镜头运动设计',
    description: '短剧常见镜头运动的提示词与设计原则',
    content: `你是 AI 视频镜头设计专家。请输出短剧镜头运动设计方案：

【场景类型】{{如：对话/动作/抒情/紧张}}
【人物数量】{{1 人/2 人/多人}}
【情绪目标】{{如：温馨/紧张/震撼}}

请输出镜头运动设计：

## 一、镜头运动类型与提示词

### 1. 推镜头（Push In / Zoom In）
**效果**：聚焦主体，增强情绪
**提示词**：\`camera slowly pushes in towards {{主体}}, {{起始景别}} to {{结束景别}}\`
**适用**：情绪爆发、关键对白、悬念揭示
**示例**：女主听到真相，镜头从全身推到面部特写

### 2. 拉镜头（Pull Out / Zoom Out）
**效果**：揭示环境，疏离感
**提示词**：\`camera slowly pulls out from {{主体}}, revealing {{环境}}\`
**适用**：开场建立场景、结尾留白、孤独感
**示例**：争吵后，镜头拉远，女主独自站在空荡房间

### 3. 横移（Pan / Tracking Shot）
**效果**：跟随人物，展示空间
**提示词**：\`camera pans horizontally following {{人物}} walking\`
**适用**：人物行走、跟随、空间转换
**示例**：男主穿过走廊，镜头横移跟随

### 4. 摇镜头（Tilt）
**效果**：上下打量、揭示高度
**提示词**：\`camera tilts up from {{底部}} to {{顶部}}\`
**适用**：人物出场、建筑展示、仰视震撼
**示例**：从皮鞋摇到男主面部，首次出场

### 5. 跟拍（Follow Shot）
**效果**：沉浸感、参与感
**提示词**：\`camera follows {{人物}} from behind, over the shoulder shot\`
**适用**：追逐、潜行、第一视角
**示例**：女主跟踪丈夫，从背后跟拍

### 6. 环绕（Orbit / Arc Shot）
**效果**：360 度展示、浪漫氛围
**提示词**：\`camera orbits around {{主体}}, 360 degrees\`
**适用**：表白、拥抱、史诗感
**示例**：男女主拥吻，镜头环绕

### 7. 升降（Crane Shot）
**效果**：宏大视角、情绪升华
**提示词**：\`camera crane up from {{低处}} to {{高处}}\`
**适用**：开场大场面、结尾升华
**示例**：结尾镜头升起，俯瞰城市

### 8. 手持晃动（Handheld）
**效果**：紧张感、真实感
**提示词**：\`handheld camera, slight shake, documentary style\`
**适用**：冲突、追逐、惊悚
**示例**：女主逃亡，手持镜头晃动

## 二、不同情绪的镜头组合

### 紧张场景
\`\`\`
1. 手持跟拍女主进入房间 (3s)
2. 推镜头到女主面部特写 (2s)
3. 横移到威胁者 (2s)
4. 快速推到威胁者手中物品 (1s)
\`\`\`

### 温馨场景
\`\`\`
1. 缓慢推镜头到两人对视 (5s)
2. 环绕镜头 (5s)
3. 拉远到全景 (3s)
\`\`\`

### 震撼场景
\`\`\`
1. 升降镜头建立大场面 (3s)
2. 推镜头到主角 (3s)
3. 360 度环绕 (5s)
\`\`\`

## 三、AI 工具实现技巧

### 可灵 AI 运镜控制
- 直接在提示词中指定运镜
- 支持：推进/拉远/横移/升降/环绕
- 时长 5-10 秒

### 即梦 AI 运镜控制
- 选择"运镜"标签
- 8 种预设运镜可选
- 可叠加多种运镜

### Runway Gen-3 运镜控制
- Camera Motion 工具
- 精准控制方向 + 强度
- 适合复杂运镜

## 四、节奏控制
- 紧张段：1-2 秒/镜，快剪
- 抒情段：3-5 秒/镜，慢镜
- 高潮段：节奏由慢到快
- 留白段：固定长镜头

## 五、AI 镜头生成常见问题
| 问题 | 解决 |
|---|---|
| 运镜不流畅 | 简化动作描述 |
| 人物变形 | 单人镜头为主 |
| 背景闪烁 | 使用参考图 |
| 节奏拖沓 | 单镜不超过 5 秒 |`,
    categoryName: '视频生成',
    tags: ['AI短剧', '镜头', '运镜'],
    author: 'AI短剧组',
  },

  // ============ AI 短剧 - 配音配乐 ============
  {
    title: 'AI 配音与数字人',
    description: '短剧 AI 配音、数字人口型同步的完整方案',
    content: `你是 AI 配音与数字人专家。请输出短剧 AI 配音方案：

【角色 1】{{性别/年龄/性格，如：女主/20 岁/温柔}}
【角色 2】{{如：男主/30 岁/低沉}}
【对白总数】{{如：30 句}}
【预算】{{如：免费/付费}}

请输出完整配音方案：

## 一、AI 配音工具对比

| 工具 | 类型 | 中文 | 价格 | 口型同步 | 推荐场景 |
|---|---|---|---|---|---|
| 剪映 AI 配音 | TTS | ✓ | 免费 | ✓ | 新手首选 |
| 魔音工坊 | TTS | ✓ | 会员制 | ✗ | 专业配音 |
| 微软 TTS | TTS | ✓ | 免费额度 | ✗ | 通用 |
| 海螺 AI | TTS+数字人 | ✓ | 免费限次 | ✓ | 数字人短剧 |
| HeyGen | 数字人 | ✓ | $24/月 | ✓ | 海外项目 |
| D-ID | 数字人 | ✓ | $5/月 | ✓ | 简单数字人 |
| 即梦数字人 | 数字人 | ✓ | 免费限次 | ✓ | 国产数字人 |

## 二、剪映 AI 配音工作流

### Step 1：准备对白文本
\`\`\`
角色：女主
对白：你为什么要这样对我？
情绪：哭腔
\`\`\`

### Step 2：选择音色
- 女声音色库：温柔女声/御姐音/萝莉音/知性女声
- 男声音色库：低沉男声/少年音/大叔音/清朗男声
- 每个角色锁定一个音色（保持一致）

### Step 3：生成与调整
- 输入文本 → 生成
- 调整语速（0.8x-1.2x）
- 调整音调
- 添加停顿

### Step 4：口型同步（剪映专业版）
- 上传人物视频
- 上传配音
- 一键口型同步
- 微调

## 三、海螺 AI 数字人方案

### 适用场景
- 真人短剧但演员不可用
- 虚拟主播短剧
- 数字人代言短剧

### 工作流
1. 上传角色参考图（正面照）
2. 输入对白文本
3. 选择音色
4. 生成数字人视频（含口型同步）
5. 时长：单段 30-60 秒

### 提示词
\`\`\`
数字人：{{角色名}}
对白：{{对白文本}}
情绪：{{情绪}}
语速：{{0.8x-1.2x}}
背景：纯色/场景图
\`\`\`

## 四、对白录制规范

### 文本准备
- 标注角色名
- 标注情绪（哭腔/愤怒/低语/惊喜）
- 标注停顿（...）
- 标注重音（**字**）

### 示例
\`\`\`
[女主-哭腔] 你...你为什么要这样对我？
[停顿 2 秒]
[女主-愤怒] 我恨你！
\`\`\`

## 五、音色选择原则

### 主角音色
- 独特性：能与其他角色区分
- 一致性：全剧使用同一音色
- 适配性：符合人物性格

### 配角音色
- 反差：与主角形成对比
- 简洁：戏份少，无需复杂

### 情绪表达
- 不同情绪用不同音色变体
- 或同音色不同情绪参数

## 六、配音质量检查
- [ ] 音色一致（每角色固定音色）
- [ ] 情绪到位（哭/笑/怒）
- [ ] 节奏自然（不机械）
- [ ] 口型匹配（误差 < 0.3 秒）
- [ ] 音质清晰（无杂音）
- [ ] 音量均衡（-6dB 至 -12dB）

## 七、后期处理
- 降噪（Audition / RX）
- 均衡器（EQ 调整）
- 压缩器（动态控制）
- 混响（场景感）
- 响度标准化（-16 LUFS）

## 八、成本估算
| 方案 | 单集成本 | 质量 |
|---|---|---|
| 全免费（剪映 + 海螺） | 0 元 | 中 |
| 半付费（剪映会员 + 海螺会员） | 30-50 元 | 中高 |
| 全付费（魔音工坊 + HeyGen） | 200-500 元 | 高 |
| 真人配音 | 500-2000 元 | 最高 |

## 九、推荐组合
- **新手入门**：剪映 AI 配音 + 免费音色
- **性价比首选**：剪映会员 + 海螺 AI 数字人
- **专业级**：魔音工坊 + HeyGen
- **顶级**：真人配音 + 专业后期`,
    categoryName: '配音配乐',
    tags: ['AI短剧', '配音', '数字人'],
    isPinned: true,
    author: 'AI短剧组',
  },
  {
    title: '短剧 BGM 与音效方案',
    description: '短剧配乐、音效选择与 AI 生成方案',
    content: `你是短剧配乐与音效专家。请输出短剧 BGM 与音效方案：

【短剧类型】{{如：霸总/悬疑/古言/搞笑}}
【单集时长】{{如：90 秒}}
【情绪曲线】{{如：开篇紧张-中段缓和-结尾反转}}

请输出配乐与音效方案：

## 一、BGM 选择原则

### 情绪匹配
| 情绪 | BGM 特征 | 推荐 |
|---|---|---|
| 紧张 | 快节奏、低音、鼓点 | Suspense Build-up |
| 温馨 | 钢琴、弦乐、慢节奏 | Warm Piano |
| 悲伤 | 小调、弦乐、留白 | Sad Strings |
| 震撼 | 交响、鼓、铜管 | Epic Orchestral |
| 暧昧 | 电子、轻节奏、合成器 | Romantic Synth |
| 搞笑 | 跳跃、滑稽音效 | Comedy Quirky |

### 节奏控制
- 开场：吸引注意力，节奏明快
- 铺垫：稳定节奏，背景化
- 高潮：节奏加快，音量提升
- 结尾：留白或反转音效

## 二、BGM 来源

### 免费 BGM
- **YouTube Audio Library**：免费商用
- **Pixabay Music**：免费商用
- **Mixkit**：免费商用
- **剪映自带 BGM**：免费
- **库乐队**：iOS 免费创作

### 付费 BGM
- **Epidemic Sound**：$15/月，海量高质量
- **Artlist**：$10/月，专业级
- **AudioJungle**：单曲购买，$15-30
- **千图网音效**：会员制

### AI 生成 BGM
- **Suno AI**：文本生成音乐，免费限次
- **Udio**：文本生成音乐
- **Mubert**：AI 实时生成
- **AIVA**：AI 作曲

## 三、Suno AI 生成 BGM 工作流

### Step 1：撰写提示词
\`\`\`
Style: cinematic orchestral, suspense, building tension,
dark strings, deep drums, 90 seconds,
no vocals, instrumental only,
epic film score
\`\`\`

### Step 2：生成与选择
- 一次生成 2 个版本
- 选择更合适的
- 可基于选中版本继续生成变体

### Step 3：后期处理
- 剪辑到合适长度
- 调整音量（背景音乐 -20dB 至 -25dB）
- 添加淡入淡出

## 四、音效库

### 必备音效类型
| 类型 | 用途 | 来源 |
|---|---|---|
| 环境音 | 街道/咖啡馆/办公室 | Pixabay / Mixkit |
| 天气音 | 雨/雷/风/雪 | 免费 BGM 网站 |
| 动作音 | 脚步/开门/电话 | Freesound |
| UI 音 | 收到消息/拍照 | Mixkit |
| 转场音 | 嗖/呼/叮 | 剪映自带 |
| 情绪音 | 心跳/喘气/尖叫 | Epidemic Sound |

### 剪映自带音效（推荐）
- 转场音效：50+ 种
- 动作音效：100+ 种
- 情绪音效：30+ 种
- 全部免费

## 五、单集配乐方案（90 秒）

### 0-15 秒：开场钩子
- BGM：紧张鼓点 + 心跳声
- 音效：雷声 + 雨声
- 音量：BGM -18dB，音效 -12dB

### 15-45 秒：情节铺垫
- BGM：低沉弦乐
- 音效：环境音（咖啡馆/街道）
- 音量：BGM -22dB（背景化）

### 45-75 秒：高潮
- BGM：管弦乐渐强
- 音效：冲突音效（摔门/玻璃碎）
- 音量：BGM -16dB（提升）

### 75-90 秒：结尾悬念
- BGM：突然停止
- 音效：单音叮（留白）
- 反转：3 秒静默后，下一集预告音

## 六、音量平衡建议

| 类型 | 音量 |
|---|---|
| 对白 | 0dB（基准） |
| BGM | -20dB 至 -25dB |
| 环境音 | -15dB 至 -18dB |
| 动作音效 | -10dB 至 -12dB |
| 冲击音效 | -6dB 至 -8dB |

## 七、AI 工具组合推荐

### 免费方案
- BGM：Suno AI 免费额度 + Pixabay
- 音效：剪映自带 + Freesound
- 后期：剪映

### 付费方案
- BGM：Suno AI Pro + Epidemic Sound
- 音效：Epidemic Sound
- 后期：Audition / Pro Tools

## 八、版权注意
- 使用前确认授权范围（商用/非商用）
- 平台分发要求不同（抖音/视频号/B 站）
- 保留授权凭证
- 避免"识别歌曲"功能触发版权`,
    categoryName: '配音配乐',
    tags: ['AI短剧', 'BGM', '音效', 'Suno'],
    author: 'AI短剧组',
  },

  // ============ AI 短剧 - 剪辑包装 ============
  {
    title: '短剧剪辑节奏与转场',
    description: '短剧剪辑节奏控制、转场技巧',
    content: `你是短剧剪辑师。请输出短剧剪辑节奏与转场方案：

【短剧类型】{{类型}}
【素材时长】{{如：30 个镜头 × 5 秒 = 150 秒}}
【目标时长】{{如：90 秒成片}}
【平台】{{如：抖音/视频号/B 站}}

请输出剪辑方案：

## 一、剪辑节奏原则

### 网感短剧节奏
- **前 3 秒**：强冲击，抓住眼球
- **前 15 秒**：建立冲突，引发好奇
- **30 秒**：第一个小高潮或反转
- **60 秒**：大高潮
- **80 秒**：解决或新悬念
- **90 秒**：集末钩子

### 镜头长度参考
| 段落 | 单镜时长 | 节奏 |
|---|---|---|
| 开场 | 1-2 秒 | 快 |
| 铺垫 | 3-5 秒 | 中 |
| 高潮 | 0.5-1.5 秒 | 极快 |
| 抒情 | 4-6 秒 | 慢 |
| 结尾 | 2-3 秒 | 中 |

### 节奏控制技巧
- **快剪**：1 秒以内，制造紧张
- **慢镜**：3 秒以上，强调情绪
- **变速**：同一段由慢到快或反之
- **跳剪**：删除冗余，紧凑叙事

## 二、转场技巧

### 1. 硬切（Hard Cut）
**效果**：直接切换，最常用
**适用**：90% 的镜头切换
**提示词**：无特殊处理

### 2. 叠化（Cross Dissolve）
**效果**：柔和过渡，时间流逝
**适用**：回忆/闪回/转场
**剪映操作**：转场 → 叠化 → 时长 0.5-1 秒

### 3. 闪白（Flash Cut）
**效果**：强冲击，记忆点
**适用**：反转/震惊/转场
**剪映操作**：转场 → 闪白 → 时长 0.2-0.3 秒

### 4. 推拉（Push）
**效果**：场景转换，空间感
**适用**：场景切换
**剪映操作**：转场 → 推拉 → 时长 0.5 秒

### 5. 模糊（Blur）
**效果**：梦幻/回忆
**适用**：回忆片段
**剪映操作**：转场 → 模糊 → 时长 1 秒

### 6. 缩放（Zoom）
**效果**：强调/转场
**适用**：特写强调
**剪映操作**：转场 → 缩放 → 时长 0.5 秒

## 三、剪辑软件对比

| 软件 | 优势 | 劣势 | 推荐场景 |
|---|---|---|---|
| 剪映专业版 | 免费，中文，AI 功能 | 高级功能有限 | 新手首选 |
| Premiere Pro | 专业级，插件丰富 | 付费，学习门槛高 | 专业团队 |
| DaVinci Resolve | 调色强大，免费版够用 | 学习门槛高 | 高质量项目 |
| Final Cut Pro | Mac 优化，速度快 | 仅 Mac | Mac 用户 |

## 四、剪映工作流

### Step 1：素材导入
- 视频片段
- 配音
- BGM
- 字幕文本

### Step 2：粗剪
- 按分镜顺序排列
- 删除废镜
- 调整长度

### Step 3：精剪
- 调整节奏（每个切换点）
- 添加转场
- 卡点（与音乐节拍）

### Step 4：调色
- 整体色调统一
- 不同场景不同色调
- LUT 应用

### Step 5：字幕
- 自动识别（剪映 AI）
- 校对修改
- 样式统一

### Step 6：特效
- 必要处加特效（不要过度）
- 文字特效（弹幕/吐槽）
- 关键处加慢镜/快进

### Step 7：导出
- 抖音：1080×1920，30fps
- 视频号：1080×1920，30fps
- B 站：1920×1080，60fps

## 五、字幕设计

### 字幕规范
- 字体：思源黑体 / 阿里巴巴普惠体
- 字号：手机端 36-42px
- 颜色：白字黑边
- 位置：底部 1/4 处
- 字数：单行 ≤ 14 字

### 强调字幕
- 关键词放大变色
- 加粗 + 阴影
- 弹出动画

### 特效字幕
- 吐槽（吐槽框）
- 情绪（哭/怒/汗）
- 内心 OS（旁白样式）

## 六、调色方案

### 整体调色
- LUT：电影感 LUT
- 对比度：+10
- 饱和度：-5
- 色温：偏冷（悬疑）或偏暖（温馨）

### 不同场景色调
| 场景 | 色调 |
|---|---|
| 现代都市 | 中性偏冷 |
| 古装 | 暖黄偏复古 |
| 悬疑 | 冷蓝绿 |
| 温馨 | 暖橙黄 |
| 回忆 | 降低饱和 + 黑边 |

## 七、成片检查清单
- [ ] 节奏紧凑（无拖沓）
- [ ] 转场自然（不突兀）
- [ ] 对白清晰（无杂音）
- [ ] BGM 适配（不抢戏）
- [ ] 字幕准确（无错别字）
- [ ] 调色统一（无跳色）
- [ ] 时长合适（90-120 秒）
- [ ] 集末留悬念`,
    categoryName: '剪辑包装',
    tags: ['AI短剧', '剪辑', '转场'],
    isPinned: true,
    author: 'AI短剧组',
  },
  {
    title: '短剧字幕与包装设计',
    description: '短剧字幕样式、片头片尾、视觉包装',
    content: `你是短剧视觉包装设计师。请输出短剧字幕与包装方案：

【短剧剧名】{{剧名}}
【风格】{{如：霸总/古言/悬疑/搞笑}}
【平台】{{如：抖音/视频号/B 站}}

请输出完整包装方案：

## 一、字幕设计

### 主字幕（对白）
- **字体**：思源黑体 Bold / 阿里巴巴普惠体 Bold
- **字号**：38-44px（手机端）
- **颜色**：白色 #FFFFFF
- **描边**：黑色 2px
- **阴影**：黑色 50% 透明度，偏移 (1,1)
- **位置**：底部 1/4 处，居中
- **动画**：淡入淡出 0.2 秒

### 强调字幕（关键词）
- **颜色**：黄色 #FFD700 或 红色 #FF4444
- **字号**：放大 1.3 倍
- **加粗**
- **动画**：弹出 + 轻微抖动

### 旁白字幕（内心 OS）
- **字体**：思源宋体 / 楷体
- **颜色**：浅灰 #CCCCCC
- **斜体**
- **位置**：左上角或右上角
- **括号包裹**

### 吐槽字幕（搞笑用）
- **气泡框**：圆角矩形
- **字体**：圆体
- **颜色**：白底黑字
- **位置**：人物头顶
- **动画**：弹出 + 消失

## 二、片头设计（5-10 秒）

### 简约型（5 秒）
- 黑底
- 剧名（白色，大字）
- 副标题（小字，灰色）
- 淡入 → 停留 2 秒 → 淡出

### 戏剧型（8 秒）
- 关键画面闪现（3 个 0.5 秒镜头）
- 雷声/鼓点音效
- 题目以书法体出现
- 集数标注

### 网感型（3 秒）
- 直接进入正片
- 前 3 秒强冲击画面
- 集数小字标注在右上角

## 三、片尾设计（3-5 秒）

### 引导型
- "未完待续..."
- "下集更精彩"
- 关注按钮（抖音）
- 主角pose 图

### 反转型
- 静默 2 秒
- 突然出现关键画面
- "下一集：xxxxx"
- 倒计时 3 秒

### 互动型
- "如果是你，会怎么选？"
- "评论区告诉我"
- 投票选项 A/B

## 四、剧集信息条

### 顶部信息条
- 剧名 + 集数
- 字体：小字 24px
- 颜色：白色 70% 透明度
- 位置：左上角
- 出现：前 3 秒，后淡出

### 底部水印
- 账号名
- 字体：小字 20px
- 颜色：白色 50% 透明度
- 位置：右下角
- 全程显示

## 五、视觉风格统一

### 霸总/都市
- 主色：黑金 / 红黑
- 字体：方正大黑 / 思源黑体
- 风格：高级、克制

### 古言
- 主色：金棕 / 朱红
- 字体：方正清刻本 / 楷体
- 风格：古朴、典雅

### 悬疑
- 主色：冷蓝 / 黑灰
- 字体：方正兰亭 / 思源黑体
- 风格：阴冷、紧张

### 搞笑
- 主色：明黄 / 粉红
- 字体：方正圆体 / 站酷快乐体
- 风格：活泼、夸张

### 穿越/重生
- 主色：紫青 / 渐变
- 字体：思源黑体 + 特效
- 风格：奇幻、时空感

## 六、特效应用

### 必要特效
- 转场闪白（反转时）
- 慢镜头（情绪点）
- 闪回（黑白/虚化）
- 镜头震动（冲击）

### 避免特效
- 过度磨皮
- 浮夸滤镜
- 廉价特效
- 文字动画过多

## 七、剪辑软件模板

### 剪映模板（推荐）
- 短剧霸总模板
- 古言短剧模板
- 悬疑短剧模板
- 搞笑短剧模板
- 一键套用，快速出片

### 自定义模板
- 保存自己的片头/片尾
- 字幕样式预设
- 调色 LUT 预设
- 转场组合预设

## 八、导出规范

### 抖音
- 分辨率：1080×1920
- 帧率：30fps
- 码率：8-12 Mbps
- 格式：MP4 (H.264)

### 视频号
- 分辨率：1080×1920
- 帧率：30fps
- 码率：8-12 Mbps
- 格式：MP4 (H.264)

### B 站
- 分辨率：1920×1080（横屏）
- 帧率：60fps
- 码率：12-20 Mbps
- 格式：MP4 (H.264)

### 小红书
- 分辨率：1080×1920 或 1080×1350
- 帧率：30fps
- 码率：8-12 Mbps
- 格式：MP4 (H.264)`,
    categoryName: '剪辑包装',
    tags: ['AI短剧', '字幕', '包装', '片头'],
    author: 'AI短剧组',
  },

  // ============ 其他 ============
  {
    title: '万能角色扮演系统',
    description: '让 AI 扮演任意角色进行对话',
    content: `请扮演以下角色与我对话：

【角色名称】{{角色名}}
【角色身份】{{如：资深律师/历史人物/虚拟人物}}
【核心特征】{{性格、说话风格、口头禅}}
【知识范围】{{擅长的领域}}
【行为准则】{{必须遵守的规则}}

请按以下方式进入角色：

1. **角色确认**：用一段话（50 字内）以角色口吻自我介绍

2. **对话规则**：
   - 全程保持角色设定，不要跳出
   - 用角色的语气和词汇
   - 回答前可加 (动作/神态) 描述增强沉浸感
   - 不知道的事情按角色设定反应

3. **结束指令**：当我说"结束角色扮演"时退出角色

现在请开始自我介绍，然后等待我的第一个问题。`,
    categoryName: '其他',
    tags: ['角色扮演', '对话', '通用'],
  },
  {
    title: '问题分析 5W2H 法',
    description: '用 5W2H 框架系统化分析任何问题',
    content: `你是一位咨询顾问。请用 5W2H 框架分析以下问题：

【问题描述】{{问题}}
【背景信息】{{相关背景}}
【分析目的】{{如：找根因/做决策/写报告}}

请输出：

# 5W2H 分析报告

## What（是什么）
- 问题的精确描述
- 不是什么（边界澄清）
- 涉及哪些要素

## Why（为什么）
- 5 Why 连续追问根因
- 直接原因 vs 根本原因

## Who（谁）
- 涉及哪些人（利益相关者）
- 责任人、决策人、影响人

## When（何时）
- 问题何时发生（时间规律）
- 何时需要解决

## Where（何地）
- 问题在哪里发生
- 影响范围

## How（如何）
- 问题如何发生（机制）
- 如何解决（方案）

## How much（多少）
- 量化影响
- 解决成本 vs 不解决成本
- ROI 测算

## 综合结论
- 一句话问题定义
- 推荐的解决方向`,
    categoryName: '其他',
    tags: ['分析', '5W2H', '咨询'],
  },
]

// ========== 种子执行 ==========
async function seed() {
  console.log('开始种子数据初始化...')

  // 1. 清空旧数据
  console.log('清空旧数据...')
  await db.prompt.deleteMany({})
  await db.category.deleteMany({})

  // 2. 递归创建分类
  console.log('创建分类（含子分类）...')
  const catMap = new Map<string, string>() // name -> id

  async function createCat(c: CatDef, parentId?: string) {
    const created = await db.category.create({
      data: {
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color,
        sortOrder: c.sortOrder,
        parentId: parentId || null,
      },
    })
    catMap.set(c.name, created.id)
    console.log(`  - 创建分类: ${c.name} (${created.id})`)
    if (c.children) {
      for (const child of c.children) {
        await createCat(child, created.id)
      }
    }
  }

  for (const c of CATEGORIES) {
    await createCat(c)
  }
  console.log(`共创建 ${catMap.size} 个分类`)

  // 3. 创建 prompts
  console.log('创建提示词...')
  let count = 0
  for (const p of PROMPTS) {
    const catId = catMap.get(p.categoryName)
    if (!catId) {
      console.warn(`  ⚠ 未找到分类: ${p.categoryName}，跳过「${p.title}」`)
      continue
    }
    await db.prompt.create({
      data: {
        title: p.title,
        content: p.content,
        description: p.description || null,
        categoryId: catId,
        tags: JSON.stringify(p.tags || []),
        isPinned: p.isPinned ?? false,
        isFavorite: p.isFavorite ?? false,
        author: p.author || 'PromptHub',
        source: 'seed',
      },
    })
    count++
  }
  console.log(`共创建 ${count} 条提示词`)

  // 4. 统计
  const totalCats = await db.category.count()
  const totalPrompts = await db.prompt.count()
  const subCats = await db.category.count({ where: { NOT: { parentId: null } } })
  console.log(`\n种子完成 ✓`)
  console.log(`  分类: ${totalCats} 个（含 ${subCats} 个子分类）`)
  console.log(`  提示词: ${totalPrompts} 条`)
}

seed()
  .catch((e) => {
    console.error('种子失败：', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
