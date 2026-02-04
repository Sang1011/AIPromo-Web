import ManagementLayout from "../../components/Organizer/ManagementLayout";
import TicketSummaryTable from "../../components/Organizer/TicketSummaryTable";
import CheckinOverview from "../../components/Organizer/CheckinOverview";

export default function CheckInPage() {
    return (
        <ManagementLayout>
            <div className="space-y-8">
                <CheckinOverview
                    checkedIn={15}
                    totalSold={20}
                    inEvent={10}
                    leftEvent={5}
                />

                <TicketSummaryTable />
            </div>
        </ManagementLayout>
    );
}
