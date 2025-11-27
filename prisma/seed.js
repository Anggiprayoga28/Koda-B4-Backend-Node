import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';
import process from 'process';

const passwordHash = '$2b$10$abcdefghijklmnopqrstuv';

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.promoProduct.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.promo.deleteMany();
  if (prisma.productVariant) {
    await prisma.productVariant.deleteMany();
  }
  await prisma.deliveryMethod.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.taxRate.deleteMany();
  await prisma.productTemperature.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.orderStatus.deleteMany();

  await prisma.user.createMany({
    data: [
      { id: 1, email: 'admin@harlanholden.com', password: passwordHash, role: 'admin' },
      { id: 2, email: 'anggi@email.com', password: passwordHash, role: 'customer' },
      { id: 3, email: 'prayoga@email.com', password: passwordHash, role: 'customer' },
      { id: 4, email: 'raka@email.com', password: passwordHash, role: 'customer' },
      { id: 5, email: 'rangga@email.com', password: passwordHash, role: 'customer' }
    ]
  });

  await prisma.userProfile.createMany({
    data: [
      {
        userId: 1,
        fullName: 'Admin Harlan Holden',
        phone: '081234567890',
        address: 'Jl. Sudirman, Jakarta Pusat',
        photoUrl: 'https://id.pinterest.com/pin/625226360811543537/'
      },
      {
        userId: 2,
        fullName: 'Anggi',
        phone: '082345678901',
        address: 'Jl. Thamrin No. 123, Jakarta Pusat',
        photoUrl: 'https://id.pinterest.com/pin/295408056838997225/'
      },
      {
        userId: 3,
        fullName: 'Prayoga',
        phone: '083456789012',
        address: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
        photoUrl: 'https://id.pinterest.com/pin/539235755400242280/'
      },
      {
        userId: 4,
        fullName: 'Raka',
        phone: '084567890123',
        address: 'Jl. HR Rasuna Said No. 78, Jakarta Selatan',
        photoUrl: 'https://id.pinterest.com/pin/187251297001767651/'
      },
      {
        userId: 5,
        fullName: 'Rangga',
        phone: '085678901234',
        address: 'Jl. Kuningan No. 90, Jakarta Selatan',
        photoUrl: 'https://id.pinterest.com/pin/238479742765437125/'
      }
    ]
  });

  await prisma.category.createMany({
    data: [
      { id: 1, name: 'Coffee', isActive: true },
      { id: 2, name: 'Non-Coffee', isActive: true },
      { id: 3, name: 'Food', isActive: true },
      { id: 4, name: 'Addon', isActive: true }
    ]
  });

  await prisma.productSize.createMany({
    data: [
      { id: 1, name: 'Regular', priceAdjustment: 0, isActive: true },
      { id: 2, name: 'Medium', priceAdjustment: 5000, isActive: true },
      { id: 3, name: 'Large', priceAdjustment: 10000, isActive: true }
    ]
  });

  await prisma.productTemperature.createMany({
    data: [
      { id: 1, name: 'Hot', price: 0, isActive: true },
      { id: 2, name: 'Iced', price: 2000, isActive: true },
      { id: 3, name: 'Warm', price: 0, isActive: true },
      { id: 4, name: 'Extra Hot', price: 1000, isActive: true },
      { id: 5, name: 'Blended', price: 3000, isActive: true }
    ]
  });

  await prisma.product.createMany({
    data: [
      {
        id: 1,
        name: 'Sea Salt Latte',
        description:
          'Latte topped with Harlan sea salt cream. Items may arrive less cold due to delivery time. Product look may vary due to delivery.',
        categoryId: 1,
        price: 67000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 100
      },
      {
        id: 2,
        name: 'Butterscotch Latte',
        description:
          'Caramel latte with sea salt, framed with cookie crumble. Items may arrive less hot/cold due to delivery time. Iced drink as seen on photo.',
        categoryId: 1,
        price: 62000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 95
      },
      {
        id: 3,
        name: 'Peanut Butter Latte',
        description:
          'A flat white with sweet and salty ground peanuts, topped with cookie crumble. Items may arrive less hot/cold due to delivery time. Product look may vary due to delivery.',
        categoryId: 1,
        price: 62000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 90
      },
      {
        id: 4,
        name: 'Cereal Latte',
        description:
          'Brown sugar latte base with sea salt cream layer and crunchy cereal crack toppings. Iced only.',
        categoryId: 1,
        price: 71000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 85
      },
      {
        id: 5,
        name: 'Pandan Latte',
        description: 'Our best selling latte with fresh pandan and cane sugar.',
        categoryId: 1,
        price: 57000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 120
      },
      {
        id: 6,
        name: 'Americano',
        description: 'A double shot espresso diluted with water.',
        categoryId: 1,
        price: 43000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 110
      },
      {
        id: 7,
        name: 'Cortado',
        description:
          'A 5oz drink of double shot espresso with the same amount of milk. Its like a small latte.',
        categoryId: 1,
        price: 43000,
        isFlashSale: false,
        isFavorite: false,
        isBuy1get1: false,
        isActive: true,
        stock: 100
      },
      {
        id: 8,
        name: 'Cappuccino',
        description:
          'A double shot of espresso with milk, microfoam, and 1.5cm wet foam.',
        categoryId: 1,
        price: 50000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 105
      },
      {
        id: 9,
        name: 'Flat White',
        description:
          'A double shot of espresso with milk, microfoam, and 0.5cm wet foam.',
        categoryId: 1,
        price: 50000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 95
      },
      {
        id: 10,
        name: 'Latte',
        description:
          'A double shot of espresso with milk, microfoam, and 1cm wet foam.',
        categoryId: 1,
        price: 50000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 115
      },
      {
        id: 11,
        name: 'Oat Milk Latte',
        description:
          'A double shot of espresso with oat milk, microfoam, and 1cm wet foam.',
        categoryId: 1,
        price: 60000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 80
      },
      {
        id: 12,
        name: 'Almond Milk Latte',
        description:
          'A double shot of espresso with almond milk, microfoam, and 1cm wet foam.',
        categoryId: 1,
        price: 62000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 75
      },
      {
        id: 13,
        name: 'Madagascar',
        description:
          'Latte with pure vanilla bean. Items may arrive less hot/cold due to delivery time.',
        categoryId: 1,
        price: 57000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 90
      },
      {
        id: 14,
        name: 'Spanish Latte',
        description:
          'Latte with house made condensed milk. Items may arrive less hot/cold due to delivery time.',
        categoryId: 1,
        price: 57000,
        isFlashSale: true,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 100
      },
      {
        id: 15,
        name: 'Brown Sugar Latte',
        description:
          'Latte with brown sugar molasses syrup. Items may arrive less hot/cold due to delivery time.',
        categoryId: 1,
        price: 215000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 95
      },
      {
        id: 16,
        name: 'Cold Brew',
        description:
          'Coffee brewed cold for 12-hours. Consume within 24hrs. Items may arrive less cold due to delivery time. Iced only.',
        categoryId: 1,
        price: 190000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 85
      },
      {
        id: 17,
        name: 'Hazelnut Latte',
        description:
          'Latte topped with a heavy roasted hazelnut cream. Items may arrive less hot/cold due to delivery time. Product look may vary due to delivery. Iced only.',
        categoryId: 1,
        price: 240000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 70
      },
      {
        id: 18,
        name: 'Campfire Coffee (Short Drink)',
        description:
          'Espresso and thick, rich and luscious double chocolate drink topped with toasted vanilla marshmallow creme.',
        categoryId: 1,
        price: 220000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 65
      },
      {
        id: 19,
        name: 'Mocha',
        description:
          'A latte with dark chocolate sauce. Items may arrive less hot/cold due to delivery time.',
        categoryId: 1,
        price: 215000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 100
      },
      {
        id: 20,
        name: 'Spanish Cold Brew',
        description:
          'Coffee brewed cold for 12-hours with enough cane sugar and heavy cream. Consume within 48hrs. Items may arrive less cold due to delivery time.',
        categoryId: 1,
        price: 230000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 75
      },
      {
        id: 21,
        name: 'Long Black',
        description: 'A double shot poured over water.',
        categoryId: 1,
        price: 135000,
        isFlashSale: false,
        isFavorite: false,
        isBuy1get1: false,
        isActive: true,
        stock: 110
      },
      {
        id: 22,
        name: 'Matcha Latte',
        description: 'Green tea with milk, microfoam, and 1cm wet foam.',
        categoryId: 2,
        price: 215000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 90
      },
      {
        id: 23,
        name: 'Mixed Berries Iced Tea',
        description:
          'A fresh blend of hibiscus, blueberry, raspberry and blackberry sweetened with cane sugar.',
        categoryId: 2,
        price: 160000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 100
      },
      {
        id: 24,
        name: 'Sparkling Water',
        description: 'Sparkling water.',
        categoryId: 2,
        price: 110000,
        isFlashSale: false,
        isFavorite: false,
        isBuy1get1: false,
        isActive: true,
        stock: 120
      },
      {
        id: 25,
        name: 'Bottled Purified Water 500ml',
        description: 'Bottled water.',
        categoryId: 2,
        price: 60000,
        isFlashSale: false,
        isFavorite: false,
        isBuy1get1: false,
        isActive: true,
        stock: 150
      },
      {
        id: 26,
        name: 'Campfire Chocolate (Short Drink)',
        description:
          'Thick, rich and luscious double chocolate drink topped with toasted vanilla marshmallow creme.',
        categoryId: 2,
        price: 170000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 70
      },
      {
        id: 27,
        name: 'Chocolate Milk',
        description: 'Dark chocolate with milk.',
        categoryId: 2,
        price: 200000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 80
      },
      {
        id: 28,
        name: 'Orange Cinnamon Iced Tea',
        description:
          'A seasonal blend of sweet zesty orange, cinnamon and cloves sweetened with cane sugar. 5 days in the chiller.',
        categoryId: 2,
        price: 160000,
        isFlashSale: false,
        isFavorite: false,
        isBuy1get1: false,
        isActive: true,
        stock: 85
      },
      {
        id: 29,
        name: 'Hot Tall Pandan Latte + Hot Honey Chicken Hand Pie',
        description: 'Hot tall pandan latte + hot honey chicken hand pie.',
        categoryId: 3,
        price: 325000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 50
      },
      {
        id: 30,
        name: 'Iced Madagascar + Grilled Cheese',
        description:
          'Best-selling latte lightly sweetened with pure vanilla bean with grilled cheese snack.',
        categoryId: 3,
        price: 325000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 45
      },
      {
        id: 31,
        name: 'Sea Salt Latte + Sea Salt Butter Cookie',
        description:
          'Our favorite sea salt latte paired with our top-selling sea salt butter cookie.',
        categoryId: 3,
        price: 380000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 40
      },
      {
        id: 32,
        name: 'Hot Tall Brown Sugar Latte + Spinach + Cheese Hand Pie',
        description:
          'Hot tall brown sugar latte with spinach + cheese hand pie.',
        categoryId: 3,
        price: 305000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 48
      },
      {
        id: 33,
        name: 'Sea Salt Latte + Sourdough Cheesesteak',
        description:
          'Best-selling sea salt latte with sourdough cheesesteak snack.',
        categoryId: 3,
        price: 435000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 35
      },
      {
        id: 34,
        name: 'Hazelnut Latte + Sourdough Cheesesteak',
        description:
          'Best-selling latte topped with heavy roasted hazelnut cream with sourdough cheesesteak snack.',
        categoryId: 3,
        price: 425000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 30
      },
      {
        id: 35,
        name: 'Pepperoni Flatbread',
        description:
          'Savory pepperoni on melted mozzarella cheese and rich vodka cream sauce on a crisp flatbread dough (note: contains seafood).',
        categoryId: 4,
        price: 135000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 60
      },
      {
        id: 36,
        name: 'Four Cheese Flatbread',
        description:
          'A mix of mozzarella, burrata, parmesan, and cream cheese, seasoned with peppercorn and maldon salt on a crisp flatbread dough.',
        categoryId: 4,
        price: 135000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 55
      },
      {
        id: 37,
        name: 'Hot Honey Chicken Hand Pie',
        description:
          'Made with ground chicken, zesty hot sauce, and a touch of honey, all wrapped in flaky pastry dough.',
        categoryId: 4,
        price: 150000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 50
      },
      {
        id: 38,
        name: 'Spinach + Cheese Hand Pie',
        description:
          'Made with chopped spinach blended with mozzarella and cheddar cheese, all enveloped in flaky pastry dough.',
        categoryId: 4,
        price: 150000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 52
      },
      {
        id: 39,
        name: 'Grilled Cheese',
        description: 'Pressed pullman with cheese, cheese and cheese.',
        categoryId: 4,
        price: 150000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 65
      },
      {
        id: 40,
        name: 'Sea Salt Butter Cookie',
        description:
          'Crisp and soft butter cookie dough with sea salt flakes and cookie butter spread.',
        categoryId: 4,
        price: 150000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 70
      },
      {
        id: 41,
        name: 'Chocolate Chip Walnut Cookie',
        description:
          'Toasted walnuts and dark chocolate in a crunchy chewy cookie.',
        categoryId: 4,
        price: 135000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 60
      },
      {
        id: 42,
        name: 'Double Chocolate Chip Cookie',
        description: 'Dark and milk cacao in crunchy chewy cookie.',
        categoryId: 4,
        price: 135000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 58
      },
      {
        id: 43,
        name: 'Swiss Chocolate Brownie',
        description:
          'Delicious soft and chewy brownie fudge with the right sweetness.',
        categoryId: 4,
        price: 135000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 55
      },
      {
        id: 44,
        name: 'Cheesecake-to-go',
        description: 'A classic New York cheesecake slice with graham crust.',
        categoryId: 4,
        price: 160000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 45
      },
      {
        id: 45,
        name: 'Toffee Crack',
        description: 'Toffee swiss chocolate bar with maldon salt flakes.',
        categoryId: 4,
        price: 325000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 35
      },
      {
        id: 46,
        name: 'Cheesesteak Melt',
        description:
          'Flavorful sandwich with roast beef brisket, grilled onions, garlic dressing and melted cheese, all in a pressed pullman.',
        categoryId: 4,
        price: 210000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 40
      },
      {
        id: 47,
        name: 'Wild Mushroom Hand Pie',
        description:
          'Made with 5 types of mushrooms: button, enoki, shimeji, oyster, and shiitake. Enriched with cream and cheese, seasoned with herbs, and wrapped in flaky pastry dough.',
        categoryId: 4,
        price: 150000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 48
      },
      {
        id: 48,
        name: 'Sourdough Cheesesteak',
        description:
          'Thinly sliced prime roast beef brisket, cheddar cheese, aioli and parmesan butter in sourdough bread.',
        categoryId: 4,
        price: 245000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 38
      },
      {
        id: 49,
        name: 'Prime Roast Beef',
        description:
          'Roast beef brisket, horseradish and grilled sweet onions in a freshly bakes sourdough.',
        categoryId: 4,
        price: 290000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 32
      },
      {
        id: 50,
        name: 'Salami Napoli Baguette',
        description:
          'Salami napoli with roasted aioli served in freshly toasted french baguette.',
        categoryId: 4,
        price: 245000,
        isFlashSale: false,
        isFavorite: true,
        isBuy1get1: false,
        isActive: true,
        stock: 42
      }
    ]
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: 1,
        imageUrl:
          'https://food-cms.grab.com/compressed_webp/items/PHITE2022091202170941286/detail/menueditor_item_3fe658f6d55f480cb1c834354295bc1f_1701164488798975198.webp',
        isPrimary: true,
        displayOrder: 1
      },
      {
        productId: 2,
        imageUrl:
          'https://food-cms.grab.com/compressed_webp/items/PHITE20220912025-1095443/detail/menueditor_item_56ff12d0ce194b87b34197432052b26d_1701164376300781634.webp',
        isPrimary: true,
        displayOrder: 1
      },
      {
        productId: 3,
        imageUrl:
          'https://food-cms.grab.com/compressed_webp/items/PHITE2025-10304205178836/detail/menueditor_item_03a89bcc43e94dafbdfaf37d75689740_1705983626322871092.webp',
        isPrimary: true,
        displayOrder: 1
      },
      {
        productId: 4,
        imageUrl:
          'https://food-cms.grab.com/compressed_webp/items/PHITE2025-10304191964125/detail/menueditor_item_556ec05ae99744afa555fc23e1913597_1705983521589490906.webp',
        isPrimary: true,
        displayOrder: 1
      },
      {
        productId: 5,
        imageUrl:
          'https://food-cms.grab.com/compressed_webp/items/PHITE2022091202161897825/detail/menueditor_item_29bcc8780b074c6689f176a334bc3ab6_1701164526305614041.webp',
        isPrimary: true,
        displayOrder: 1
      },
      {
        productId: 6,
        imageUrl:
          'https://food-cms.grab.com/compressed_webp/items/PHITE2022111608533096371/detail/menueditor_item_77c30fb249fb491bac3eb05522beb91a_1701165051471861885.webp',
        isPrimary: true,
        displayOrder: 1
      },
      {
        productId: 6,
        imageUrl:
          'https://i.pinimg.com/1200x/e8/06/81/e8068186818ad7f0223acf7732643d98.jpg',
        isPrimary: false,
        displayOrder: 2
      },
      {
        productId: 6,
        imageUrl:
          'https://i.pinimg.com/736x/d5/2e/4e/d52e4e807352c3421ed89d95ddee75a2.jpg',
        isPrimary: false,
        displayOrder: 3
      },
      {
        productId: 6,
        imageUrl:
          'https://i.pinimg.com/1200x/32/ba/52/32ba52056d30b5bed11e6aeb2ad30874.jpg',
        isPrimary: false,
        displayOrder: 4
      }
    ]
  });

  await prisma.productReview.createMany({
    data: [
      {
        productId: 1,
        userId: 2,
        rating: 5,
        reviewText: 'Sea salt cream on top is amazing! Perfect balance.'
      },
      {
        productId: 2,
        userId: 3,
        rating: 5,
        reviewText: 'Butterscotch latte is so good! Love the cookie crumble.'
      },
      {
        productId: 14,
        userId: 4,
        rating: 5,
        reviewText: 'Pandan latte is the best! Unique and refreshing.'
      },
      {
        productId: 8,
        userId: 2,
        rating: 5,
        reviewText: 'Perfect americano for morning boost!'
      },
      {
        productId: 3,
        userId: 5,
        rating: 5,
        reviewText: 'Matcha latte is authentic and delicious.'
      }
    ]
  });

  await prisma.promo.createMany({
    data: [
      {
        id: 1,
        code: 'MOTHERSDAY',
        title: 'HAPPY MOTHERS DAY!',
        description: 'Get one of our favorite menu for free!',
        discountPercentage: 100,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-12'),
        isActive: true
      },
      {
        id: 2,
        code: 'WEEKEND50',
        title: 'WEEKEND SPECIAL!',
        description: '50% off on all coffee drinks!',
        discountPercentage: 50,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-31'),
        isActive: true
      },
      {
        id: 3,
        code: 'BUY1GET1',
        title: 'BUY 1 GET 1 FREE',
        description: 'On selected items this week only!',
        discountPercentage: 50,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-31'),
        isActive: true
      },
      {
        id: 4,
        code: 'FREECOFFEE',
        title: 'Get a cup of coffee for free',
        description: 'On sunday morning only on may 6!',
        discountPercentage: 100,
        startDate: new Date('2025-10-06'),
        endDate: new Date('2025-10-06'),
        isActive: true
      }
    ]
  });

  await prisma.promoProduct.createMany({
    data: [
      { promoId: 2, productId: 1 },
      { promoId: 2, productId: 2 },
      { promoId: 2, productId: 3 },
      { promoId: 2, productId: 4 },
      { promoId: 3, productId: 8 },
      { promoId: 3, productId: 27 }
    ]
  });

  await prisma.deliveryMethod.createMany({
    data: [
      {
        id: 1,
        name: 'Dine In',
        baseFee: 0,
        description: 'Order food to eat on the spot',
        isActive: true
      },
      {
        id: 2,
        name: 'Door Delivery',
        baseFee: 10000,
        description: 'Delivery within 30-45 minutes',
        isActive: true
      },
      {
        id: 3,
        name: 'Pick Up',
        baseFee: 0,
        description: 'Pick up at store location',
        isActive: true
      }
    ]
  });

  await prisma.paymentMethod.createMany({
    data: [
      {
        id: 1,
        name: 'Bank BRI',
        description: 'Transfer via Bank BRI',
        isActive: true
      },
      {
        id: 2,
        name: 'DANA',
        description: 'Pay with DANA e-wallet',
        isActive: true
      },
      {
        id: 3,
        name: 'BCA',
        description: 'Transfer via Bank BCA',
        isActive: true
      },
      {
        id: 4,
        name: 'GoPay',
        description: 'Pay with GoPay e-wallet',
        isActive: true
      },
      {
        id: 5,
        name: 'OVO',
        description: 'Pay with OVO e-wallet',
        isActive: true
      },
      {
        id: 6,
        name: 'PayPal',
        description: 'Pay with PayPal',
        isActive: true
      },
      {
        id: 7,
        name: 'Cash on Delivery',
        description: 'Pay with cash when order arrives',
        isActive: true
      }
    ]
  });

  await prisma.taxRate.createMany({
    data: [
      { id: 1, name: 'PPN 10%', ratePercentage: 10.0, isActive: true },
      { id: 2, name: 'Service Charge 5%', ratePercentage: 5.0, isActive: true }
    ]
  });

  if (prisma.productVariant) {
    await prisma.productVariant.createMany({
      data: [
        { name: 'Regular', description: 'Varian standar', price: 0, isActive: true },
        { name: 'Decaf', description: 'Tanpa kafein', price: 3000, isActive: true },
        { name: 'Oat Milk', description: 'Dengan susu oat', price: 5000, isActive: true },
        { name: 'Almond Milk', description: 'Dengan susu almond', price: 5000, isActive: true },
        { name: 'Soy Milk', description: 'Dengan susu kedelai', price: 4000, isActive: true },
        { name: 'Extra Shot', description: 'Tambahan espresso shot', price: 8000, isActive: true },
        { name: 'Sugar Free', description: 'Tanpa gula', price: 0, isActive: true },
        { name: 'Extra Cream', description: 'Tambahan krim', price: 3000, isActive: true },
        { name: 'Caramel Drizzle', description: 'Dengan caramel drizzle', price: 4000, isActive: true },
        { name: 'Chocolate Chip', description: 'Dengan chocolate chip', price: 5000, isActive: true }
      ]
    });
  }

  await prisma.orderStatus.createMany({
    data: [
      {
        id: 1,
        name: 'pending',
        displayName: 'Pending',
        description: 'Order is waiting for confirmation',
        displayOrder: 1,
        isActive: true
      },
      {
        id: 2,
        name: 'on_progress',
        displayName: 'On Progress',
        description: 'Order is being prepared',
        displayOrder: 2,
        isActive: true
      },
      {
        id: 3,
        name: 'sending_goods',
        displayName: 'Sending Goods',
        description: 'Order is being delivered',
        displayOrder: 3,
        isActive: true
      },
      {
        id: 4,
        name: 'finish_order',
        displayName: 'Finish Order',
        description: 'Order has been completed',
        displayOrder: 4,
        isActive: true
      },
      {
        id: 5,
        name: 'cancelled',
        displayName: 'Cancelled',
        description: 'Order has been cancelled',
        displayOrder: 5,
        isActive: true
      }
    ]
  });

  await prisma.order.createMany({
    data: [
      {
        id: 1,
        orderNumber: 'ORD-2023-001',
        userId: 2,
        statusId: 2,
        deliveryAddress: 'Jl. Thamrin No. 123, Jakarta Pusat',
        deliveryMethodId: 1,
        subtotal: 460000,
        deliveryFee: 0,
        taxAmount: 0,
        total: 460000,
        paymentMethodId: 1,
        orderDate: new Date('2023-01-23T10:30:00')
      },
      {
        id: 2,
        orderNumber: 'ORD-2023-002',
        userId: 2,
        statusId: 2,
        deliveryAddress: 'Jl. Thamrin No. 123, Jakarta Pusat',
        deliveryMethodId: 1,
        subtotal: 230000,
        deliveryFee: 0,
        taxAmount: 0,
        total: 230000,
        paymentMethodId: 2,
        orderDate: new Date('2023-01-24T14:20:00')
      },
      {
        id: 3,
        orderNumber: 'ORD-2023-003',
        userId: 2,
        statusId: 2,
        deliveryAddress: 'Jl. Thamrin No. 123, Jakarta Pusat',
        deliveryMethodId: 1,
        subtotal: 215000,
        deliveryFee: 0,
        taxAmount: 0,
        total: 215000,
        paymentMethodId: 1,
        orderDate: new Date('2023-01-25T09:15:00')
      },
      {
        id: 4,
        orderNumber: 'ORD-2023-004',
        userId: 2,
        statusId: 2,
        deliveryAddress: 'Jl. Thamrin No. 123, Jakarta Pusat',
        deliveryMethodId: 1,
        subtotal: 190000,
        deliveryFee: 0,
        taxAmount: 0,
        total: 190000,
        paymentMethodId: 3,
        orderDate: new Date('2023-01-26T16:45:00')
      },
      {
        id: 5,
        orderNumber: 'ORD-2023-005',
        userId: 2,
        statusId: 4,
        deliveryAddress: 'Jl. Thamrin No. 123, Jakarta Pusat',
        deliveryMethodId: 1,
        subtotal: 250000,
        deliveryFee: 0,
        taxAmount: 0,
        total: 250000,
        paymentMethodId: 1,
        orderDate: new Date('2023-01-20T11:30:00')
      },
      {
        id: 6,
        orderNumber: 'ORD-2023-006',
        userId: 2,
        statusId: 3,
        deliveryAddress: 'Jl. Thamrin No. 123, Jakarta Pusat',
        deliveryMethodId: 2,
        subtotal: 185000,
        deliveryFee: 10000,
        taxAmount: 0,
        total: 195000,
        paymentMethodId: 2,
        orderDate: new Date('2023-01-27T08:20:00')
      }
    ]
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: 1,
        productId: 1,
        quantity: 2,
        sizeId: 1,
        temperatureId: 2,
        unitPrice: 230000,
        isFlashSale: false
      },
      {
        orderId: 2,
        productId: 2,
        quantity: 1,
        sizeId: 1,
        temperatureId: 2,
        unitPrice: 230000,
        isFlashSale: false
      },
      {
        orderId: 3,
        productId: 5,
        quantity: 1,
        sizeId: 1,
        temperatureId: 2,
        unitPrice: 215000,
        isFlashSale: false
      },
      {
        orderId: 4,
        productId: 6,
        quantity: 1,
        sizeId: 1,
        temperatureId: 1,
        unitPrice: 190000,
        isFlashSale: false
      },
      {
        orderId: 5,
        productId: 4,
        quantity: 1,
        sizeId: 1,
        temperatureId: 2,
        unitPrice: 250000,
        isFlashSale: false
      },
      {
        orderId: 6,
        productId: 6,
        quantity: 1,
        sizeId: 1,
        temperatureId: 1,
        unitPrice: 185000,
        isFlashSale: false
      }
    ]
  });

  await prisma.cartItem.createMany({
    data: [
      {
        userId: 2,
        productId: 1,
        quantity: 1,
        sizeId: 1,
        temperatureId: 2
      },
      {
        userId: 2,
        productId: 30,
        quantity: 1
      },
      {
        userId: 3,
        productId: 5,
        quantity: 1,
        sizeId: 1,
        temperatureId: 2
      },
      {
        userId: 3,
        productId: 33,
        quantity: 2
      },
      {
        userId: 4,
        productId: 11,
        quantity: 1,
        sizeId: 1,
        temperatureId: 1
      }
    ]
  });
}
 
main()
  .catch((e) => {
    console.error('Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });