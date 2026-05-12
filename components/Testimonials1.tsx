// A single, featured testimonial. Replace the quote, name and role with the real ones.
// To bring back the customer photo and the company logo, swap the <div> blocks for <Image />
// components pointing to local assets in /public.
const Testimonial = () => {
  return (
    <section
      className="relative isolate overflow-hidden bg-base-100 px-8 py-24 sm:py-32"
      id="testimonials"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.base-300),theme(colors.base-100))] opacity-20" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-base-100 shadow-lg ring-1 ring-base-content/10 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      <div className="mx-auto max-w-2xl lg:max-w-5xl">
        <figure className="mt-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="relative rounded-xl border border-base-content/5 bg-base-content/5 p-1.5 sm:-rotate-1">
              <div className="rounded-lg w-[280px] h-[280px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] flex items-center justify-center bg-base-200 text-4xl font-semibold text-base-content/40 border-2 border-white/10 shadow-md">
                J
              </div>
            </div>

            <div>
              <blockquote className="text-xl font-medium leading-8 text-base-content sm:text-2xl sm:leading-10">
                A short, punchy quote from a real customer about the value they
                got from your product. Keep it specific and outcome-oriented.
              </blockquote>
              <figcaption className="mt-10 flex items-center justify-start gap-5">
                <div className="text-base">
                  <div className="font-semibold text-base-content mb-0.5">
                    Jane Doe
                  </div>
                  <div className="text-base-content/60">
                    Role &amp; Company
                  </div>
                </div>
              </figcaption>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
};

export default Testimonial;
