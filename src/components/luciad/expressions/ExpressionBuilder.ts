import * as ExpressionFactory from "@luciad/ria/util/expression/ExpressionFactory";

import { ScalingMode } from "@luciad/ria/view/style/ScalingMode";
import {boolean, Expression} from "@luciad/ria/util/expression/ExpressionFactory";

const COLORSPAN = ["rgb(0,0,128)", "rgb(0,0,255)", "rgb(0,255,0)", "rgb(255,255,0)", "rgb(255,0,0)"];

// const COLORSPAN_CLASIFICATION = ["rgb(0,255,0)", "rgb(127,255,0)", "rgb(255,165,0)", "rgb(255,255,0)", "rgb(255,0,0)"];
export const COLORSPAN_CLASSIFICATION = [
    "rgb(180,180,180)",  // 0
    "rgb(184,184,184)",  // 1
    "rgb(163,112,0)",  // 2
    "rgb(37,111,0)",  // 3
    "rgb(73,226,0)",  // 4
    "rgb(207,239,132)",  // 5
    "rgb(217,104,64)",  // 6
    "rgb(229,0,0)",  // 7
    "rgb(170,115,0)",  // 8
    "rgb(0,92,230)",  // 9
    "rgb(132,0,168)",  // 10
    "rgb(250,250,250)",  // 11
    "rgb(199,0,255)",  // 12
    "rgb(0,0,0)",  // 13
    "rgb(128,128,128)",  // 14
    "rgb(226,222,1)",  // 15
    "rgb(225,227,3)",  // 16
    "rgb(237,229,6)",  // 17
    "rgb(228,230,0)",  // 18
];

export const DEFAULT_COLORMAP_CLASSIFICATION = [
    "Never Classified",  // 0
    "Unassigned",  // 1
    "Ground",  // 2
    "Low vegetation",  // 3
    "Medium vegetation",  // 4
    "High vegetation",  // 5
    "Building",  // 6
    "Noise",  // 7
    "Model-Key/Reserved",  // 8
    "Water",  // 9
    "Rail",  // 10
    "Road surface",  // 11
    "Overlapped/Reserved",  // 12
    "Wire - Guard",  // 13
    "Wire - Connector",  // 14
    "Transmission Tower",  // 15
    "Wire - Connector",  // 16
    "Bridge Deck",  // 17
    "High noise",  // 18
];

class ExpressionBuilder  {
    public validStyles = ["Intensity", "Height", "Classification"];
    public validFilters = ["Intensity", "Height", "Classification"];

    //   public HSPCKeyMap = { C: "Classification", I: "Intensity", H: "Height" };

    public validStylesHSPC = ["Intensity", "Height", "Classification" ];
    public validFiltersHSPC = ["Intensity", "Height", "Classification"];
    //  public validStylesHSPC: string[] = [];
    //   public validFiltersHSPC: string[] = [];

    public generareDefaultClassificationFilter() {
        return new Array(19).fill(true);
    }

    public visibilityExpression(filter: any) {
        let expression: any;
        if (filter.name.toLowerCase() === "classification") {
            expression = {
                visibilityMap: [] as Expression<boolean>[],
                expression: () => {
                    const attribute = typeof filter.index !== "undefined" ? ExpressionFactory.attribute(filter.index) : ExpressionFactory.attribute(filter.name);
                    expression.visibilityMap = filter.filterArray.map((c: boolean, index: number) => {
                        return ExpressionFactory.boolean(c);
                    });
                    return ExpressionFactory.map( attribute, expression.visibilityMap, ExpressionFactory.boolean(false))
                },
                maxParameter: ExpressionFactory.numberParameter(filter.value.maximum),
                minParameter: ExpressionFactory.numberParameter(filter.value.minimum),

                type: "visibilityExpression",
                update: (newFilterArray: boolean[]) => {
                    newFilterArray.map((value: boolean, index: number) => {
                        expression.visibilityMap[index].value = value;
                    })
                }
            }
            return expression
        }

        if (filter.name && typeof filter.name === "string" && filter.name.trim().length>0) {
            expression = {
                expression: () => {
                    const attribute = ExpressionFactory.attribute(filter.name);
                    return ExpressionFactory.and(
                        ExpressionFactory.lt(expression.minParameter, attribute),
                        ExpressionFactory.gt(expression.maxParameter, attribute)
                    );
                },
                maxParameter: ExpressionFactory.numberParameter(filter.value.maximum),
                minParameter: ExpressionFactory.numberParameter(filter.value.minimum),
                // The expression evaluates to true/false value

                type: "visibilityExpression",
                update: (array: any[]) => {
                    expression.minParameter.value = Number(array[0]);
                    expression.maxParameter.value = Number(array[1]);
                    filter.value.minimum = expression.minParameter.value;
                    filter.value.maximum = expression.maxParameter.value;
                }
            }
        }
        return expression;
    }

    public colorExpression(style: any) {
        let expression: any;
        if (style.name === "Intensity") {
            expression = {
                expression: () => {
                    const attribute = typeof style.index !== "undefined" ? ExpressionFactory.attribute(style.index) : ExpressionFactory.attribute("Intensity"); //
                    const fraction = ExpressionFactory.fraction( attribute, expression.minParameter, expression.maxParameter);
                    return ExpressionFactory.mixmap(fraction, [ExpressionFactory.color("rgb(0,0,80)"), ExpressionFactory.color("rgb(255,255,255)")]);
                },
                maxParameter: ExpressionFactory.numberParameter(style.value.maximum),
                minParameter: ExpressionFactory.numberParameter(style.value.minimum),

                type: "colorExpression",

                update: (array:any[]) => {
                    expression.minParameter.value = Number(array[0]);
                    expression.maxParameter.value = Number(array[1]);
                    style.value.minimum = expression.minParameter.value;
                    style.value.maximum = expression.maxParameter.value;
                }
            }
        }
        if (style.name === "Height") {
            expression = {
                expression: () => {
                    const attribute = typeof style.index !== "undefined" ? ExpressionFactory.attribute(style.index) : ExpressionFactory.attribute("Height");
                    const fraction = ExpressionFactory.fraction(attribute, expression.minParameter, expression.maxParameter);
                    const colorMix = COLORSPAN.map((c) =>{
                        return ExpressionFactory.color(c);
                    });
                    return ExpressionFactory.mixmap(fraction, colorMix);
                },
                maxParameter: ExpressionFactory.numberParameter(style.value.maximum),
                minParameter: ExpressionFactory.numberParameter(style.value.minimum),

                type: "colorExpression",
                update: (array:any[]) => {
                    expression.minParameter.value = Number(array[0]);
                    expression.maxParameter.value = Number(array[1]);
                    style.value.minimum = expression.minParameter.value;
                    style.value.maximum = expression.maxParameter.value;
                }
            }
        }
        if (style.name === "Classification") {
            expression = {
                expression: ()  => {
                    const attribute = typeof style.index !== "undefined" ? ExpressionFactory.attribute(style.index) : ExpressionFactory.attribute("Classification");
                    // const fraction = ExpressionFactory.fraction(classificationValue, expression.minParameter, expression.maxParameter);
                    const colorMix = COLORSPAN_CLASSIFICATION.map((c) => {
                        return ExpressionFactory.color(c);
                    });
                    return ExpressionFactory.map(attribute, colorMix, ExpressionFactory.color('rgb(0,0,0)'));
                },
                maxParameter: ExpressionFactory.numberParameter(0 /*style.value.maximum*/),
                minParameter: ExpressionFactory.numberParameter(18 /*style.value.minimum*/),
                type: "colorExpression",

                update: (array:any[]) => {
                    expression.minParameter.value = Number(0 /*array[0]*/);
                    expression.maxParameter.value = Number(18 /*array[1]*/);
                    style.value.minimum = expression.minParameter.value;
                    style.value.maximum = expression.maxParameter.value;
                }
            }
        }
        return expression;
    }

    public scaleExpression(scale: any) {
        const expression = {
            expression: () => {
                return expression.factorParameter;
            },
            factorParameter: ExpressionFactory.numberParameter(scale.value),
            type: "scaleExpression",

            update: (newFactor: number) => {
                expression.factorParameter.value = +newFactor;
                scale.value = expression.factorParameter.value;
            }
        }
        return expression;
    }

    public scalingMode(scalingMode: any) {
        const expression = {
            expression : () => {
                if (scalingMode.value === 1) {
                    return ScalingMode.ADAPTIVE_WORLD_SIZE;
                } else {
                    return ScalingMode.PIXEL_SIZE;
                }
            },
            update: (newFactor: number) => {
                scalingMode.value = newFactor
            }
        }
        return expression;
    }
}

export default new ExpressionBuilder();
