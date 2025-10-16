import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2, Link2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { googleSheetsRequestSchema, type GoogleSheetsRequest } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface GoogleSheetsInputProps {
  onLoadData: (data: GoogleSheetsRequest) => void;
  isLoading?: boolean;
}

export function GoogleSheetsInput({ onLoadData, isLoading }: GoogleSheetsInputProps) {
  const form = useForm<GoogleSheetsRequest>({
    resolver: zodResolver(googleSheetsRequestSchema),
    defaultValues: {
      spreadsheetUrl: "",
      nameColumn: "A",
      phoneColumn: "B",
      taskColumn: "C",
    },
  });

  const onSubmit = (data: GoogleSheetsRequest) => {
    onLoadData(data);
  };

  return (
    <Card data-testid="card-google-sheets">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Google Sheets Data
        </CardTitle>
        <CardDescription>
          Masukkan link Google Sheets yang berisi data kontak
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="spreadsheetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Google Sheets</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="pl-9"
                        data-testid="input-spreadsheet-url"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="nameColumn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kolom Nama</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="A"
                        className="font-mono text-center"
                        data-testid="input-name-column"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneColumn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kolom No. WA</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="B"
                        className="font-mono text-center"
                        data-testid="input-phone-column"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taskColumn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kolom Tugas</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="C"
                        className="font-mono text-center"
                        data-testid="input-task-column"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
              data-testid="button-load-data"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat Data...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  Muat Data
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
