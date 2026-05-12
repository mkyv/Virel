// A short testimonial (one or two sentences).
// Highlight the outcome for your customer or the pain it removes.
// Use <span className="bg-warning/25 px-1.5"> to emphasize a specific phrase.
const Testimonial1Small = () => {
  return (
    <section className="bg-base-100">
      <div className="space-y-6 md:space-y-8 max-w-lg mx-auto px-8 py-16 md:py-32 ">
        <div className="rating !flex justify-center">
          {[...Array(5)].map((_, i) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-warning"
              key={i}
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>
        <div className="text-base leading-relaxed space-y-2 max-w-md mx-auto text-center">
          <p>
            <span className="bg-warning/25 px-1.5">
              A short, punchy claim from a real customer.
            </span>{" "}
            A second sentence that adds context or expands the result.
          </p>
        </div>
        <div className="flex justify-center items-center gap-3 md:gap-4">
          <span className="w-10 h-10 md:w-12 md:h-12 rounded-full flex justify-center items-center text-lg font-medium bg-base-300">
            J
          </span>
          <div>
            <p className="font-semibold">Jane Doe</p>
            <p className="text-base-content/80 text-sm">Role &amp; Company</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial1Small;
