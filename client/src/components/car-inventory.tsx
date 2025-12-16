import { Car as CarIcon, Fuel, Gauge, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Car } from "@shared/schema";

interface CarInventoryProps {
  cars: Car[];
  isLoading?: boolean;
  highlightedCarId?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(mileage: number): string {
  return new Intl.NumberFormat("en-US").format(mileage);
}

function CarCardSkeleton() {
  return (
    <Card className="overflow-visible">
      <div className="aspect-[4/3] relative overflow-hidden rounded-t-md">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function CarCard({ car, isHighlighted }: { car: Car; isHighlighted?: boolean }) {
  return (
    <Card
      className={`overflow-visible transition-all duration-200 hover-elevate ${
        isHighlighted ? "ring-2 ring-primary" : ""
      }`}
      data-testid={`card-car-${car.id}`}
    >
      <div className="aspect-[4/3] relative overflow-hidden rounded-t-md bg-muted">
        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CarIcon className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        {isHighlighted && (
          <Badge className="absolute top-2 left-2" variant="default">
            Recommended
          </Badge>
        )}
        <Badge
          className="absolute top-2 right-2"
          variant={car.isAvailable ? "secondary" : "destructive"}
        >
          {car.isAvailable ? "Available" : "Sold"}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-display text-lg font-bold truncate" data-testid={`text-car-title-${car.id}`}>
          {car.year} {car.make} {car.model}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {formatMileage(car.mileage)} miles • {car.color}
        </p>
        <p className="font-display text-2xl font-bold text-primary mb-4" data-testid={`text-car-price-${car.id}`}>
          {formatPrice(car.price)}
        </p>
        <div className="flex flex-wrap gap-2">
          {car.mpgCity && car.mpgHighway && (
            <Badge variant="outline" className="gap-1">
              <Fuel className="w-3 h-3" />
              {car.mpgCity}/{car.mpgHighway} MPG
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <Settings2 className="w-3 h-3" />
            {car.transmission}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Gauge className="w-3 h-3" />
            {car.drivetrain}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function CarInventory({ cars, isLoading, highlightedCarId }: CarInventoryProps) {
  if (isLoading) {
    return (
      <div className="h-full p-4">
        <h2 className="font-display text-2xl font-bold mb-4">Our Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CarCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <CarIcon className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Vehicles Found</h3>
        <p className="text-muted-foreground">
          Ask our AI assistant to help you find the perfect car.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h2 className="font-display text-2xl font-bold mb-4" data-testid="text-inventory-title">
          Our Inventory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              isHighlighted={car.id === highlightedCarId}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
