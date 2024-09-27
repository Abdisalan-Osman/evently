"use client";

type EventFormProps = {
  userId: string;
  type: "create" | "update";
};

import React, { useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

// CSS Modules, react-datepicker-cssmodules.css

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { EventFormSchema } from "@/lib/validator";
import { z } from "zod";
import { eventDefaultValues } from "@/constants";
import DropDown from "./DropDown";
import { Textarea } from "../ui/textarea";
import FileUploader from "./FileUploader";

import Image from "next/image";
import { Label } from "../ui/label";
import { useUploadThing } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/actions/event.actions";

function EventForm({ userId, type }: EventFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("imageUploader");
  const initialValues = eventDefaultValues;

  const router = useRouter();

  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: initialValues,
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof EventFormSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-5 md:flex-row">
          {/* INPUT */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    placeholder="Event title"
                    {...field}
                    className="input-filed"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* CATEGORY */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <DropDown
                    onChangeHandler={field.onChange}
                    value={field.value}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="h-72">
                  <Textarea
                    placeholder="Description"
                    {...field}
                    className="textarea rounded-2xl"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="h-72">
                  <FileUploader
                    onFieldChange={field.onChange}
                    image={field.value}
                    setFiles={setFiles}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* location */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] bg-grey-50 w-full rounded-full overflow-hidden px-4 py-2 relative">
                    <Image
                      src="/assets/icons/location-grey.svg"
                      alt="calender"
                      width={24}
                      height={24}
                      className=""
                    />

                    <Input
                      placeholder="Event location or online "
                      {...field}
                      className="input-field "
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/*STARTDATE */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/assets/icons/calendar.svg"
                      alt="calender"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <p className="ml-3 whitespace-nowrap text-grey-600">
                      Start Date:
                    </p>

                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      wrapperClassName="datePicker"
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          {/*ENDDATE */}

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/assets/icons/calendar.svg"
                      alt="calender"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <p className="ml-3 whitespace-nowrap text-grey-600">
                      end Date:
                    </p>

                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      wrapperClassName="datePicker"
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* PRICE */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/assets/icons/dollar.svg"
                      alt="dollar"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      {...field}
                      className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />

                    {/* isFree */}
                    <FormField
                      control={form.control}
                      name="isFree"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center">
                              <Label
                                htmlFor="isFree"
                                className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Free ticket
                              </Label>

                              <Checkbox
                                id="isFree"
                                onCheckedChange={field.onChange}
                                checked={field.value}
                                className="mr-2 h-5 w-5 border-2 border-primary-500"
                              />
                            </div>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* url */}
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] bg-grey-50 w-full rounded-full overflow-hidden px-4 py-2 relative">
                    <Image
                      src="/assets/icons/link.svg"
                      alt="link"
                      width={24}
                      height={24}
                      className=""
                    />

                    <Input
                      placeholder="URL "
                      {...field}
                      className="input-field "
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          size="lg"
          className="button col-span-2 w-full"
        >
          {form.formState.isSubmitting ? "Submitting" : `${type} Event`}
        </Button>
      </form>
    </Form>
  );
}

export default EventForm;
