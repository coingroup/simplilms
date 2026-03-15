"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Label } from "@simplilms/ui";
import {
  personalInfoSchema,
  type PersonalInfoData,
} from "../../lib/validations/application-schema";
import type { ApplicationFormData } from "../../lib/validations/application-schema";

interface StepPersonalInfoProps {
  data: ApplicationFormData;
  onNext: (data: Partial<ApplicationFormData>) => void;
}

export function StepPersonalInfo({ data, onNext }: StepPersonalInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name || "",
      email: data.email,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
    },
  });

  const onSubmit = (formData: PersonalInfoData) => {
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Personal Information
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Please provide your personal details as they appear on your
          government-issued ID.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="first_name"
            {...register("first_name")}
            placeholder="Enter your first name"
          />
          {errors.first_name && (
            <p className="text-xs text-red-500">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="last_name">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="last_name"
            {...register("last_name")}
            placeholder="Enter your last name"
          />
          {errors.last_name && (
            <p className="text-xs text-red-500">{errors.last_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="middle_name">Middle Name</Label>
          <Input
            id="middle_name"
            {...register("middle_name")}
            placeholder="Optional"
          />
          {errors.middle_name && (
            <p className="text-xs text-red-500">{errors.middle_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date_of_birth">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register("date_of_birth")}
          />
          {errors.date_of_birth && (
            <p className="text-xs text-red-500">
              {errors.date_of_birth.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="(404) 555-0123"
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-[#F26822] hover:bg-[#d4571b] text-white"
        >
          Next: Address
        </Button>
      </div>
    </form>
  );
}
