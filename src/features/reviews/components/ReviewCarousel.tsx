import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useReviews } from "../hooks/useReviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "#f5c518" : "#e4e4e4", fontSize: 18 }}>
          &#9733;
        </span>
      ))}
    </div>
  );
}

export function ReviewCarousel() {
  const { data, isLoading } = useReviews();

  if (isLoading)
    return (
  // use className instead of style
      <div className="flex items-center justify-center gap-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 min-w-80 m-2">
            <div className="h-10 w-10 rounded-full bg-card" />
            <div className="h-4 w-32 bg-card my-2" />
            <div className="h-3 w-24 bg-card my-1" />
            <div className="h-5 w-full bg-card my-2" />
          </Card>
        ))}
      </div>
    );

  if (!data || !data.length) return <div>No reviews yet.</div>;

  // Carousel: Simple horizontal scroll for now. You can sub in a slider lib easily.
  return (
    <Carousel className="w-full max-w-4xl mx-auto">
      <CarouselContent>
        {data.map((testimonial, index) => (
          <CarouselItem key={index}>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="p-2">
                <CardHeader>
                  <CardTitle className="overflow-hidden">
                    <Quote className={`h-8 w-8 text-primary mb-4`} />
                    <p className="text-foreground/80 mb-6 italic">"{testimonial.review_text}"</p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <UserAvatar
                      size="lg"
                      avatarUrl={testimonial.user_profile?.avatar_url!}
                      username={
                        testimonial.user_profile?.username ||
                        testimonial.user_profile?.full_name ||
                        "Anonymous"
                      }
                    />
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-foreground">
                        {testimonial.user_profile?.full_name ||
                          testimonial.user_profile?.username ||
                          "Anonymous"}
                      </h4>
                      <p className={`text-primary text-sm`}>
                        {typeof testimonial.weight_change_kg === "number" ? (
                          <span style={{ color: "#26b366", fontWeight: 500, fontSize: 13 }}>
                            {testimonial.weight_change_kg < 0
                              ? `Lost ${Math.abs(testimonial.weight_change_kg)}kg`
                              : testimonial.weight_change_kg > 0
                              ? `Gained ${testimonial.weight_change_kg}kg`
                              : null}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={testimonial.rating} />
                </CardContent>
              </Card>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
