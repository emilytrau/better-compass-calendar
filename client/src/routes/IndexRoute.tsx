import * as dateMath from 'date-arithmetic';
import * as React from 'react';
import { 
    RouteComponentProps, 
    withRouter 
} from 'react-router-dom';
import {
    Button,
    ButtonGroup,
    InputGroup,
    InputGroupAddon
} from 'reactstrap';
import { IEventDetails } from '../api';
import BCCBigCalendar, { View } from '../components/BCCBigCalendar';
import BCCExportiCalModal from '../components/BCCExportiCalModal';
import BCCFilterBox from '../components/BCCFilterBox';
import BCCNavBar from '../components/BCCNavBar';
import BCCEventDetailModal from './../components/BCCEventDetailModal';
import './IndexRoute.css';

interface IRouterProps {
    filter?: string;
    eventid?: string;
}

interface IProps extends RouteComponentProps<IRouterProps> {}

interface IState {
    filter: string;
    appliedFilter: string;
    view: View;
    date: Date;
    showingEventId: string | null;
    icalModalOpen: boolean;
}

/**
 * IndexRoute
 * Renders the main page and detailed event view
 */
class IndexRoute extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        // Retrieve the filter from the url if applied
        const initialFilter = this.props.match.url === '/f/' ? '' : decodeURIComponent(this.props.match.params.filter || 'subscribed ');
        this.state = {
            filter: initialFilter,
            appliedFilter: initialFilter,
            view: 'day',
            date: new Date(),
            showingEventId: this.props.match.params.eventid || null,
            icalModalOpen: false
        }

        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleFilterGo = this.handleFilterGo.bind(this);
        this.handleTodayGo = this.handleTodayGo.bind(this);
        this.handleDayViewClick = this.handleDayViewClick.bind(this);
        this.handleWeekViewClick = this.handleWeekViewClick.bind(this);
        this.handleMonthViewClick = this.handleMonthViewClick.bind(this);
        this.handlePrevClick = this.handlePrevClick.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleCloseEventModal = this.handleCloseEventModal.bind(this);
        this.handleOpenICalModal = this.handleOpenICalModal.bind(this);
        this.handleCloseICalModal = this.handleCloseICalModal.bind(this);
    }

    public render() {
        const { filter, appliedFilter, view, date, showingEventId, icalModalOpen } = this.state;

        return (
            <div className='IndexRoute-Root'>
                <BCCNavBar />
                <div className='IndexRoute-Body'>
                    <div className='IndexRoute-Controls'>
                        <div className='IndexRoute-ControlsLeft'>
                            <InputGroup>
                                <InputGroupAddon addonType='prepend'>Filter:</InputGroupAddon>
                                <BCCFilterBox filter={ filter } onChange={ this.handleFilterChange } />
                                <InputGroupAddon addonType='append'>
                                    <Button onClick={ this.handleFilterGo }>Go</Button>
                                </InputGroupAddon>
                            </InputGroup>
                            <Button onClick={ this.handleOpenICalModal }>Export iCal</Button>
                        </div>
                        <div className='IndexRoute-ControlsRight'>
                            <h4>
                                { view === 'month' ? date.toLocaleString('en-au', { month: 'long', year: 'numeric' }) : undefined}
                            </h4>
                            <ButtonGroup>
                                <Button onClick={ this.handleTodayGo }>Today</Button>
                            </ButtonGroup>
                            <ButtonGroup>
                                <Button onClick={ this.handleMonthViewClick } active={ view === 'month' }>M</Button>
                                <Button onClick={ this.handleWeekViewClick } active={ view === 'week' }>W</Button>
                                <Button onClick={ this.handleDayViewClick } active={ view === 'day' }>D</Button>
                            </ButtonGroup>
                            <ButtonGroup>
                                <Button onClick={ this.handlePrevClick }>&lt;</Button>
                                <Button onClick={ this.handleNextClick }>&gt;</Button>
                            </ButtonGroup>
                        </div>
                    </div>
                    <div className='IndexRoute-Calendar'>
                        <BCCBigCalendar
                            filter={ appliedFilter }
                            view={ view }
                            date={ date }
                            onViewChange={ this.handleViewChange }
                            onDateChange={ this.handleDateChange }
                            onEventClick={ this.handleEventClick }
                        />
                    </div>
                </div>
                <BCCEventDetailModal
                    isOpen={ showingEventId !== null }
                    eventId={ showingEventId }
                    onClose={ this.handleCloseEventModal }
                />
                <BCCExportiCalModal 
                    isOpen={ icalModalOpen } 
                    filter={ appliedFilter } 
                    onClose={ this.handleCloseICalModal }
                />
            </div>
        );
    }

    /**
     * Called when the filter is changed
     */
    private handleFilterChange(filter: string) {
        this.setState({ filter });

        if (filter === 'subscribed') {
            this.props.history.replace('/');
        } else {
            this.props.history.replace('/f/' + encodeURIComponent(filter));
        }
    }

    private handleFilterGo() {
        this.setState({ appliedFilter: this.state.filter });
    }

    private handleTodayGo() {
        this.setState({ date: new Date() });
    }

    private handleDayViewClick() {
        this.setState({ view: 'day' });
    }

    private handleWeekViewClick() {
        this.setState({ view: 'week' });
    }

    private handleMonthViewClick() {
        this.setState({ view: 'month' });
    }

    private handlePrevClick() {
        // Move back one time period
        const { view, date } = this.state;
        this.setState({ date: dateMath.subtract(date, 1, view) });
    }

    private handleNextClick() {
        // Move forward one time period
        const { view, date } = this.state;
        this.setState({ date: dateMath.add(date, 1, view) });
    }

    private handleViewChange(view: View) {
        this.setState({ view });
    }

    private handleDateChange(date: Date) {
        this.setState({ date });
    }

    private handleEventClick(event: IEventDetails) {
        // Navigate to event view
        this.props.history.replace('/e/' + event.id);
        this.setState({ showingEventId: event.id });
    }

    private handleCloseEventModal() {
        this.props.history.replace('/');
        this.setState({ showingEventId: null });
    }

    private handleOpenICalModal() {
        this.setState({ icalModalOpen: true });
    }

    private handleCloseICalModal() {
        this.setState({ icalModalOpen: false });
    }
}

export default withRouter(IndexRoute);