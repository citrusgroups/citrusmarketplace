import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
export const metadata = { title: "Our story" };
const values = [
  [
    "Built on friendship",
    "Four friends, united by a shared ambition and a responsibility to build something lasting.",
  ],
  [
    "Grounded in research",
    "A considered approach to products, suppliers and the everyday needs of businesses.",
  ],
  [
    "Focused on trust",
    "Clear communication, realistic commitments and relationships that grow through consistent work.",
  ],
];
export default function About() {
  return (
    <main className="bg-white">
      <section className="mx-auto grid max-w-[1170px] items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-orange-600">
            OUR STORY · EST. 2024
          </p>
          <h1 className="inter mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Four friends.
            <br />
            One shared ambition.
          </h1>
          <div className="mt-8 space-y-5 text-base leading-8 text-black/65">
            <p>
              Two years ago, in 2024, four friends came together with a simple
              ambition: to build a company that creates lasting value through
              thoughtful products, practical services and relationships built on
              trust. That ambition became CITRUS.
            </p>
            <p>
              From the beginning, we saw commerce as more than buying and
              selling. We were interested in the work behind it—the research
              that identifies a worthwhile product, the care involved in
              evaluating suppliers, and the attention required to serve a
              customer well. Those principles shaped our direction as we
              explored online business and the Amazon marketplace.
            </p>
            <p>
              Our Amazon services reflect that same practical approach. We
              support businesses with product research, wholesale sourcing
              assistance, listing improvement and account management. Each
              service begins with understanding the business, agreeing on a
              clear scope and focusing on work that supports its next step.
            </p>
            <p>
              Citrus Products brings our product vision into the everyday
              workplace. Our focus is office supplies, paper, stationery and
              workspace essentials: the items that help businesses, teams and
              learning environments keep moving. We aim to make that selection
              easier to explore and the product information easier to
              understand.
            </p>
            <p>
              We are still the four friends who started with one shared idea. As
              CITRUS grows, we remain committed to earning trust through careful
              work, open communication and a long-term view of every
              relationship.
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded bg-orange-500 px-7 py-4 text-sm font-medium text-white"
          >
            Let’s talk about your business →
          </Link>
        </div>
        <div className="overflow-hidden rounded bg-orange-50">
          <div className="p-10 sm:p-14">
            <BrandLogo className="mx-auto w-full max-w-sm" />
            <p className="mt-10 text-2xl font-medium leading-relaxed">
              A shared beginning.
              <br />
              <span className="text-orange-600">A purposeful future.</span>
            </p>
          </div>
          <img
            src="/images/office-essentials-hero.png"
            alt="Carefully arranged office supplies"
            className="h-64 w-full object-cover object-right"
          />
        </div>
      </section>
      <section className="border-t border-black/10 bg-[#FAFAFA]">
        <div className="mx-auto grid max-w-[1170px] gap-9 px-4 py-16 md:grid-cols-3">
          {values.map(([h, p], i) => (
            <article key={h}>
              <p className="mb-4 text-sm font-semibold text-orange-600">
                0{i + 1}
              </p>
              <h2 className="inter text-xl font-semibold">{h}</h2>
              <p className="mt-4 leading-7 text-black/65">{p}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
