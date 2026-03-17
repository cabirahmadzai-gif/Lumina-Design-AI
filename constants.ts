import { ItemType } from './types';

export const GEMSTONE_TYPES: ItemType[] = [
  {
    id: 'diamond',
    name: 'الماس (Diamond)',
    description: 'سخت‌ترین ماده طبیعی، درخشش بی‌نظیر',
    image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'ruby',
    name: 'یاقوت سرخ (Ruby)',
    description: 'نماد عشق و قدرت، رنگ قرمز تند',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'emerald',
    name: 'زمرد (Emerald)',
    description: 'رنگ سبز غنی، نماد تولد دوباره',
    image: 'https://images.unsplash.com/photo-1601121853354-e6e866bd2aca?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'sapphire',
    name: 'یاقوت کبود (Sapphire)',
    description: 'سنگ خرد و پادشاهی، معمولاً آبی',
    image: 'https://images.unsplash.com/photo-1573408301145-b98c46544405?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'turquoise',
    name: 'فیروزه (Turquoise)',
    description: 'سنگ محافظت، آبی متمایل به سبز',
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'agate',
    name: 'عقیق (Agate)',
    description: 'تنوع رنگی بالا، ایجاد تعادل',
    image: 'https://images.unsplash.com/photo-1587307293166-5d20fa225114?auto=format&fit=crop&w=200&q=80',
  },
];

export const ANTIQUE_TYPES: ItemType[] = [
  {
    id: 'pottery',
    name: 'سفال و سرامیک',
    description: 'ظروف سفالی و سرامیکی باستانی',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'metalwork',
    name: 'ظروف فلزی',
    description: 'آثار فلزی، مس، برنج و طلا',
    image: 'https://images.unsplash.com/photo-1589884483321-224673846610?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'manuscript',
    name: 'نسخ خطی',
    description: 'کتاب‌ها و دست‌نوشته‌های قدیمی',
    image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'carpet',
    name: 'فرش و دستباف',
    description: 'قالی و گلیم‌های آنتیک',
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=200&q=80',
  },
];

export const COIN_TYPES: ItemType[] = [
  {
    id: 'ancient_persian',
    name: 'سکه ایران باستان',
    description: 'هخامنشی، اشکانی، ساسانی',
    image: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'islamic',
    name: 'سکه دوران اسلامی',
    description: 'اموی، عباسی، صفوی، قاجار',
    image: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'roman_greek',
    name: 'سکه روم و یونان',
    description: 'سکه‌های باستانی غربی',
    image: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'modern_rare',
    name: 'سکه کمیاب معاصر',
    description: 'سکه‌های ارزشمند قرون اخیر',
    image: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=200&q=80',
  },
];

export const INITIAL_CHAT_MESSAGE = "سلام! من دستیار هوشمند شما هستم. عکس سنگ، شیء آنتیک یا سکه خود را آپلود کنید تا اصالت، قدمت و ارزش تقریبی آن را بررسی کنم.";
