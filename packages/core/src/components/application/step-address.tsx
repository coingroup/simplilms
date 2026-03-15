"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Label } from "@simplilms/ui";
import {
  addressSchema,
  US_STATES,
  type AddressData,
} from "../../lib/validations/application-schema";
import type { ApplicationFormData } from "../../lib/validations/application-schema";
import { useEffect } from "react";

interface StepAddressProps {
  data: ApplicationFormData;
  onNext: (data: Partial<ApplicationFormData>) => void;
  onBack: () => void;
}

export function StepAddress({ data, onNext, onBack }: StepAddressProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line1: data.address_line1,
      address_line2: data.address_line2 || "",
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      country: data.country || "United States",
      same_as_residential: false,
      mailing_address_line1: data.mailing_address_line1 || "",
      mailing_address_line2: data.mailing_address_line2 || "",
      mailing_city: data.mailing_city || "",
      mailing_state: data.mailing_state || "",
      mailing_zip: data.mailing_zip || "",
      mailing_country: data.mailing_country || "",
    },
  });

  const sameAsResidential = useWatch({ control, name: "same_as_residential" });
  const residentialFields = useWatch({
    control,
    name: ["address_line1", "address_line2", "city", "state", "zip_code", "country"],
  });

  // Copy residential to mailing when "same as residential" is checked
  useEffect(() => {
    if (sameAsResidential) {
      setValue("mailing_address_line1", residentialFields[0] || "");
      setValue("mailing_address_line2", residentialFields[1] || "");
      setValue("mailing_city", residentialFields[2] || "");
      setValue("mailing_state", residentialFields[3] || "");
      setValue("mailing_zip", residentialFields[4] || "");
      setValue("mailing_country", residentialFields[5] || "");
    }
  }, [sameAsResidential, residentialFields, setValue]);

  const onSubmit = (formData: AddressData) => {
    const { same_as_residential, ...addressData } = formData;

    // If same as residential, copy fields
    if (same_as_residential) {
      addressData.mailing_address_line1 = addressData.address_line1;
      addressData.mailing_address_line2 = addressData.address_line2;
      addressData.mailing_city = addressData.city;
      addressData.mailing_state = addressData.state;
      addressData.mailing_zip = addressData.zip_code;
      addressData.mailing_country = addressData.country;
    }

    onNext(addressData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Residential Address
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter your current residential address.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="address_line1">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address_line1"
            {...register("address_line1")}
            placeholder="123 Main Street"
          />
          {errors.address_line1 && (
            <p className="text-xs text-red-500">
              {errors.address_line1.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="address_line2">Apartment, Suite, Unit</Label>
          <Input
            id="address_line2"
            {...register("address_line2")}
            placeholder="Apt 4B (optional)"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">
            City <span className="text-red-500">*</span>
          </Label>
          <Input id="city" {...register("city")} placeholder="Atlanta" />
          {errors.city && (
            <p className="text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="state">
            State <span className="text-red-500">*</span>
          </Label>
          <select
            id="state"
            {...register("state")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-xs text-red-500">{errors.state.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="zip_code">
            ZIP Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="zip_code"
            {...register("zip_code")}
            placeholder="30301"
          />
          {errors.zip_code && (
            <p className="text-xs text-red-500">{errors.zip_code.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country">
            Country <span className="text-red-500">*</span>
          </Label>
          <Input
            id="country"
            {...register("country")}
            placeholder="United States"
          />
          {errors.country && (
            <p className="text-xs text-red-500">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* Mailing Address */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Mailing Address
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Where should we send correspondence?
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("same_as_residential")}
              className="h-4 w-4 rounded border-gray-300 text-[#F26822] focus:ring-[#F26822]"
            />
            <span className="text-sm text-gray-700">
              Same as residential
            </span>
          </label>
        </div>

        {!sameAsResidential && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="mailing_address_line1">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mailing_address_line1"
                {...register("mailing_address_line1")}
                placeholder="123 Main Street"
              />
              {errors.mailing_address_line1 && (
                <p className="text-xs text-red-500">
                  {errors.mailing_address_line1.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="mailing_address_line2">
                Apartment, Suite, Unit
              </Label>
              <Input
                id="mailing_address_line2"
                {...register("mailing_address_line2")}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mailing_city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mailing_city"
                {...register("mailing_city")}
                placeholder="City"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mailing_state">
                State <span className="text-red-500">*</span>
              </Label>
              <select
                id="mailing_state"
                {...register("mailing_state")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mailing_zip">
                ZIP Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mailing_zip"
                {...register("mailing_zip")}
                placeholder="ZIP code"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mailing_country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mailing_country"
                {...register("mailing_country")}
                placeholder="United States"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          className="bg-[#F26822] hover:bg-[#d4571b] text-white"
        >
          Next: Program
        </Button>
      </div>
    </form>
  );
}
