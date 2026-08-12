import { Nav } from "@/components/home/Nav";
import { Hero } from "@/components/home/Hero";
import { WorkCollage } from "@/components/home/WorkCollage";
import { ExperienceRadio } from "@/components/home/ExperienceRadio";
import { Connect } from "@/components/home/Connect";
import { FooterTicker } from "@/components/home/FooterTicker";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ExperienceRadio />
        <WorkCollage />
        <Connect />
      </main>
      <FooterTicker />
    </>
  );
}
