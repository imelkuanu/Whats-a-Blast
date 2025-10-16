import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Send, UserPlus, Briefcase, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { broadcastMessageSchema, type BroadcastMessage } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

interface MessageComposerProps {
  onSend: (data: BroadcastMessage) => void;
  isSending?: boolean;
  selectedCount: number;
}

export function MessageComposer({ onSend, isSending, selectedCount }: MessageComposerProps) {
  const form = useForm<BroadcastMessage>({
    resolver: zodResolver(broadcastMessageSchema),
    defaultValues: {
      message: "",
      delay: 2,
    },
  });

  const message = form.watch("message");
  const delay = form.watch("delay");

  const insertVariable = (variable: string) => {
    const currentMessage = form.getValues("message");
    form.setValue("message", currentMessage + `{${variable}}`);
  };

  const onSubmit = (data: BroadcastMessage) => {
    onSend(data);
  };

  return (
    <Card data-testid="card-message-composer">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Tulis Pesan Broadcast
        </CardTitle>
        <CardDescription>
          Gunakan variabel untuk personalisasi pesan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesan</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ketik pesan Anda di sini..."
                      className="min-h-32 resize-none"
                      data-testid="textarea-message"
                    />
                  </FormControl>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable("nama")}
                        className="gap-1.5"
                        data-testid="button-insert-nama"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        {"{nama}"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable("tugas")}
                        className="gap-1.5"
                        data-testid="button-insert-tugas"
                      >
                        <Briefcase className="h-3.5 w-3.5" />
                        {"{tugas}"}
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {message.length} / 4096
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jeda Antar Pesan</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        data-testid="slider-delay"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 detik</span>
                        <Badge variant="outline" className="font-mono">
                          {delay} detik
                        </Badge>
                        <span>10 detik</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Jeda waktu antar pengiriman pesan untuk menghindari spam
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isSending || selectedCount === 0}
                data-testid="button-send-broadcast"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Kirim ke {selectedCount} Kontak
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {message && (
          <div className="mt-6 pt-6 border-t">
            <Label className="text-sm font-medium mb-2 block">Preview Pesan</Label>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap" data-testid="text-message-preview">
                {message.replace(/{nama}/g, "John").replace(/{tugas}/g, "Mengerjakan laporan")}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
