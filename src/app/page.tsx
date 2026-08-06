import AnnouncementBar from "@/components/AnnouncementBar";
import CategoriesSection from "@/components/CategoriesSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LatestPosts from "@/components/LatestPosts";
import Newsletter from "@/components/Newsletter";
import { getCategories, getHeroPost, getTrending } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [heroPost, trending, categories] = await Promise.all([
    getHeroPost(),
    getTrending(),
    getCategories(),
  ]);

  return (
    <>
      <AnnouncementBar />
      <Header categories={categories} />
      <main className="flex-1">
        {heroPost && <HeroSection heroPost={heroPost} trending={trending} />}
        <CategoriesSection />
        <LatestPosts />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
