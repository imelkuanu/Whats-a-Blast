import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import type { Contact, MessageStatus } from "@shared/schema";

interface ContactsTableProps {
  contacts: Contact[];
  selectedContacts: Set<string>;
  onSelectContact: (contactId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  contactStatuses?: Map<string, MessageStatus>;
}

export function ContactsTable({ 
  contacts, 
  selectedContacts, 
  onSelectContact, 
  onSelectAll,
  contactStatuses = new Map()
}: ContactsTableProps) {
  const allSelected = contacts.length > 0 && selectedContacts.size === contacts.length;
  const someSelected = selectedContacts.size > 0 && selectedContacts.size < contacts.length;

  const getStatusBadge = (status?: MessageStatus) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="outline" className="gap-1.5 bg-chart-2/10 text-chart-2 border-chart-2/20">
            <CheckCircle2 className="h-3 w-3" />
            Terkirim
          </Badge>
        );
      case 'sending':
        return (
          <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/20">
            <Loader2 className="h-3 w-3 animate-spin" />
            Mengirim
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="gap-1.5 bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="h-3 w-3" />
            Gagal
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1.5 bg-muted/50 text-muted-foreground border-border">
            <Clock className="h-3 w-3" />
            Menunggu
          </Badge>
        );
      default:
        return null;
    }
  };

  if (contacts.length === 0) {
    return (
      <Card data-testid="card-contacts-empty">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada data kontak</p>
          <p className="text-xs text-muted-foreground mt-1">
            Muat data dari Google Sheets untuk memulai
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-contacts-table">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg">Daftar Kontak</CardTitle>
          <CardDescription className="mt-1.5">
            {contacts.length} kontak tersedia, {selectedContacts.size} dipilih
          </CardDescription>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {contacts.length}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={onSelectAll}
                      data-indeterminate={someSelected}
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="font-mono">Nomor WhatsApp</TableHead>
                  <TableHead>Tugas</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => {
                  const isSelected = selectedContacts.has(contact.id);
                  const status = contactStatuses.get(contact.id);
                  
                  return (
                    <TableRow 
                      key={contact.id}
                      className="hover-elevate"
                      data-testid={`row-contact-${contact.id}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            onSelectContact(contact.id, checked as boolean)
                          }
                          data-testid={`checkbox-contact-${contact.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-name-${contact.id}`}>
                        {contact.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm" data-testid={`text-phone-${contact.id}`}>
                        {contact.phone}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`text-task-${contact.id}`}>
                        {contact.task || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(status)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
