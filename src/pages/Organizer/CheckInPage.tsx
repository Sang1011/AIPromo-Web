import CheckinOverview from "../../components/Organizer/checkin/CheckinOverview";
import TicketSummaryTable from "../../components/Organizer/ticket/TicketSummaryTable";

export default function CheckInPage() {
    return (
        <div className="space-y-8">
            <CheckinOverview
                checkedIn={15}
                totalSold={20}
                inEvent={10}
                leftEvent={5}
            />

            <TicketSummaryTable />
        </div>
    );
}
