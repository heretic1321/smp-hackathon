import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PartyEventDto } from '../dto/parties.dto';

@Injectable()
export class PartySseService {
  private eventSubjects = new Map<string, Subject<PartyEventDto>>();

  /**
   * Get or create SSE stream for a party
   */
  getPartyStream(partyId: string): Observable<PartyEventDto> {
    if (!this.eventSubjects.has(partyId)) {
      this.eventSubjects.set(partyId, new Subject<PartyEventDto>());
    }

    return this.eventSubjects.get(partyId)!.asObservable();
  }

  /**
   * Emit event to all subscribers of a party
   */
  emitToParty(partyId: string, event: PartyEventDto): void {
    const subject = this.eventSubjects.get(partyId);
    if (subject) {
      subject.next(event);
    }
  }

  /**
   * Emit event to multiple parties
   */
  emitToParties(partyIds: string[], event: PartyEventDto): void {
    partyIds.forEach(partyId => {
      this.emitToParty(partyId, event);
    });
  }

  /**
   * Get filtered stream for specific event types
   */
  getFilteredStream(partyId: string, eventTypes: string[]): Observable<PartyEventDto> {
    return this.getPartyStream(partyId).pipe(
      filter(event => eventTypes.includes(event.type))
    );
  }

  /**
   * Clean up party stream when party is destroyed
   */
  cleanupPartyStream(partyId: string): void {
    const subject = this.eventSubjects.get(partyId);
    if (subject) {
      subject.complete();
      this.eventSubjects.delete(partyId);
    }
  }

  /**
   * Get active party count
   */
  getActivePartyCount(): number {
    return this.eventSubjects.size;
  }

  /**
   * Get all active party IDs
   */
  getActivePartyIds(): string[] {
    return Array.from(this.eventSubjects.keys());
  }

  /**
   * Clean up old/inactive streams (call periodically)
   */
  cleanupInactiveStreams(): void {
    // For now, we'll rely on TTL indexes in MongoDB
    // In a production system, you might want to track last activity
    // and clean up streams that haven't had activity for a while
  }
}
