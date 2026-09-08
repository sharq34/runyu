// 照片墙的数据。目前先放在前端，等内容稳定后再挪到 api/src/data。
//
// 图片放在 web/public/images/ 下，文件名和这里的 file 字段一致。
// 图片不存在时页面会显示一个带说明的占位块，不会报错。
//
// caption / story 是 AI 生成的占位文案，请按真实情况改。
//
// 横屏照片：加 wide: true，网格里会横跨两格（手机上占满一行），不会被裁成竖的。
// 裁切位置：focus 是 CSS object-position，比如 '50% 70%' 表示优先保留偏下的部分。

export type Tone = 'petal' | 'bloom' | 'leaf' | 'sand' | 'ink'

export type Photo = {
  id: string
  file: string
  /** 占位块上显示的说明，对应你发的哪张照片 */
  label: string
  /** 一句话标题，常驻显示 */
  caption: string
  place?: string
  date?: string
  /** 照片背后的故事，悬停 / 点开时显示 */
  story: string
  /** 原图宽 / 高，灯箱里用 */
  ratio: number
  /** 横屏照片设 true，网格里横跨两格 */
  wide?: boolean
  /** 网格裁切时优先保留的位置（object-position） */
  focus?: string
  tone: Tone
}

/** 首页背景：抱着花束那张 */
export const HERO: Photo = {
  id: 'hero',
  file: '/images/hero.jpg',
  label: '抱着粉色花束（首页背景）',
  caption: '花到家了',
  story: '',
  ratio: 4 / 3,
  tone: 'petal',
}

export const PHOTOS: Photo[] = [
  {
    id: 'hoodie-hearts',
    file: '/images/hoodie-hearts.jpg',
    label: '白色连帽衫 · 举手比心',
    caption: '比一个很大的心',
    story: '玻璃门上还贴着圣诞的窗花，她举起双手，比了一个很大的心。后来我才知道，这个心是隔着屏幕，比给我看的。',
    ratio: 3 / 4,
    tone: 'petal',
  },
  {
    id: 'blazer-smile',
    file: '/images/blazer-smile.jpg',
    label: '棕色西装 · 眯眼笑 · 比耶',
    caption: '眼睛笑没了',
    story: '穿上西装的她是 HR Director，认真起来没人敢打岔。可只要一笑，眼睛就弯成两条缝，像在说：别怕，有我在。',
    ratio: 3 / 4,
    tone: 'sand',
  },
  {
    id: 'blue-sun',
    file: '/images/blue-sun.jpg',
    label: '蓝色毛衣 · 闭眼晒太阳',
    caption: '把脸交给太阳',
    story: '冬天的公交车上，阳光刚好落在她脸上。她闭上眼睛，嘴角翘着，像一只晒暖了的猫。那一刻她什么都没想，只是在享受。',
    ratio: 3 / 4,
    focus: '50% 40%',
    tone: 'bloom',
  },
  {
    id: 'dog',
    file: '/images/dog.jpg',
    label: '车里 · 和狗狗 · 嘟嘴',
    caption: '和它一样开心',
    story: '副驾驶上多了一个毛茸茸的乘客。它吐着舌头笑，她嘟着嘴笑，两个都不肯好好看镜头。阳光从车窗漏进来，那天的路怎么开都觉得短。',
    ratio: 3 / 4,
    focus: '50% 45%',
    tone: 'sand',
  },
  {
    id: 'red-wall',
    file: '/images/red-wall.jpg',
    label: '红墙「吾正当红」· 碎花裙',
    caption: '吾正当红',
    story: '红墙上写着「吾正当红」，她站在下面双手叉腰，笑得像这句话本来就是为她写的。也确实是。在我这里，她一直当红。',
    ratio: 2 / 3,
    focus: '50% 75%',
    tone: 'ink',
  },
  {
    id: 'srilanka',
    file: '/images/srilanka.jpg',
    label: '斯里兰卡红色巴士前跳跃',
    caption: '裙摆扬起来的那一秒',
    place: '斯里兰卡',
    story: '斯里兰卡的乡间公路，一辆老红巴士停在路边。她说要跳一张，裙摆扬起来的瞬间，整条路都亮了。她就是这样，去哪儿都能把日子过成风景。',
    ratio: 3 / 4,
    tone: 'leaf',
  },
  {
    id: 'beach-back',
    file: '/images/beach-back.jpg',
    label: '海边 · 白裙背影 · 风吹头发',
    caption: '风从海上来',
    story: '海边的风把她的头发吹得乱七八糟，她也不管，闭着眼睛坐在那儿，像在听海说话。我在她身后看了很久，没有走近，怕打扰这份安静。',
    ratio: 2 / 3,
    focus: '50% 55%',
    tone: 'bloom',
  },
  {
    id: 'lawn-floral',
    file: '/images/lawn-floral.jpg',
    label: '草地 · 碎花裙 · 回头笑',
    caption: '草地上的光',
    story: '午后的草地，阳光穿过树叶落在她身上。她回头笑的那一秒我想，就这样吧，往后的日子，都想让她这样笑着。',
    ratio: 2 / 3,
    focus: '50% 45%',
    tone: 'leaf',
  },
]
