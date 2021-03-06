import * as React from "react";
import {observer} from "mobx-react";
import {AppStore} from "../../stores/AppStore";
import * as Plotly from "plotly.js/dist/plotly-cartesian";
import createPlotlyComponent from "react-plotly.js/factory";
import ReactResizeDetector from "react-resize-detector";
import {Config, Data, Layout} from "plotly.js";
import "./SpatialProfilerComponent.css";

// This allows us to use a minimal Plotly.js bundle with React-Plotly.js (900k compared to 2.7 MB)
const Plot = createPlotlyComponent(Plotly);

class SpatialProfilerComponentProps {
    label: string;
    dataSourceId: number;
    profileCoordinate: string;
    appStore: AppStore;
}

@observer
export class SpatialProfilerComponent extends React.Component<SpatialProfilerComponentProps, { width: number, height: number }> {

    constructor(props: SpatialProfilerComponentProps) {
        super(props);
        this.state = {width: 0, height: 0};
    }

    onResize = (width: number, height: number) => {
        this.setState({width, height});
    };

    render() {
        const appStore = this.props.appStore;
        const backgroundColor = "#F2F2F2";
        const isXProfile = this.props.profileCoordinate.indexOf("x") >= 0;

        let plotLayout: Partial<Layout> = {
            width: this.state.width,
            height: this.state.height,
            paper_bgcolor: backgroundColor,
            plot_bgcolor: backgroundColor,
            xaxis: {
                title: `Image ${this.props.profileCoordinate.toUpperCase()}-coordinate`
            },
            yaxis: {
                title: "Value"
            },
            margin: {
                t: 10,
                r: 10,
                l: 60,
                b: 60,
            }
        };

        let plotData: Partial<Data[]> = [];
        let plotConfig: Partial<Config> = {
            displaylogo: false,
            modeBarButtonsToRemove: ["toImage", "sendDataToCloud", "toggleHover", "toggleSpikelines", "hoverClosestCartesian", "hoverCompareCartesian"],
            setBackground: "transparent"
        };

        if (appStore.spatialProfiles.has(this.props.dataSourceId)) {
            const profileStore = appStore.spatialProfiles.get(this.props.dataSourceId);
            const coordinateData = profileStore.profiles.filter(data => data.coordinate === this.props.profileCoordinate);
            if (coordinateData.length) {
                // Will eventually need WCS coordinate info
                let xVals = new Array(coordinateData[0].values.length);
                let yVals = new Array(coordinateData[0].values.length);
                for (let i = 0; i < xVals.length; i++) {
                    xVals[i] = coordinateData[0].start + i;
                }

                plotData.push({
                    x: xVals,
                    y: coordinateData[0].values,
                    type: "scatter",
                    mode: "lines",
                    line: {
                        width: 1.0,
                        shape: "hv"
                    }
                });
                plotLayout.shapes = [{
                    yref: "paper",
                    type: "line",
                    x0: isXProfile ? profileStore.x : profileStore.y,
                    x1: isXProfile ? profileStore.x : profileStore.y,
                    y0: 0,
                    y1: 1,
                    line: {
                        color: "red",
                        width: 1
                    }
                }];
            }
        }
        return (
            <div style={{width: "100%", height: "100%"}}>
                <Plot layout={plotLayout} data={plotData} config={plotConfig}/>
                <ReactResizeDetector handleWidth handleHeight onResize={this.onResize}/>
            </div>
        );
    }
}