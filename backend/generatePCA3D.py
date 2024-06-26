# --------------------------------
#
# 🚀 Created by Quang, 2024
# ✉️ For any inquiries, suggestions, or discussions related to this work, feel free to contact me at: voquang.usth@gmail.com
#
# --------------------------------

#########################
#
# ⭐⭐⭐
# NOTICE
# Check the file "generatePCA.py" for the detail explanation, as almost the code here is similar to the code in "generatePCA.py"
# There is only one difference in this file compared to the file "generatePCA.py": the coordinates for the 3D plot is x, y, and z, instead of x and y
# ==> so in this file, we put x, y, and z at "pcaScatterCoordinates" and "layoutPCAPlotForReact" variables
# ⭐⭐⭐
#
#########################

import pandas as pd
from flask import Blueprint, jsonify, request
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


def is_number_or_not(s):
    # Check file "generatePCA.py" for the detail explanation
    try:
        if isinstance(s, str):
            s = s.replace(',', '')
        float(s)
    except ValueError:
        return False
    else:
        return True


bp = Blueprint('generatePCA3D', __name__)


@bp.route('/api/generate_pca_3d', methods=['POST'])
def generate_pca_3d():
    #########################
    # CODE SIMILAR TO "generatePCA.py"
    #########################
    initialData = request.json
    convertedData = pd.DataFrame(data=initialData)

    non_numeric_columns = [col for col in convertedData.columns if not is_number_or_not(
        convertedData[col].iloc[0])]
    if len(non_numeric_columns) > 1:
        convertedData.drop(non_numeric_columns[1:], axis=1, inplace=True)
    convertedData.set_index(non_numeric_columns[0], inplace=True)

    convertedData = convertedData.replace(',', '.', regex=True)
    convertedData = convertedData.astype(float)
    convertedData = convertedData.dropna()

    standardScalerObject = StandardScaler()
    dataAfterStandardization = standardScalerObject.fit_transform(
        convertedData.T)

    # The "n_components" parameter is used to specify the number of principal components to be created
    # If not specified, then default value of "n_components" is min(n_samples, n_features)
    # For example, if the number of samples is 24 and the number of genes is 1000, then the default value of "n_components" will be 24
    # If the number of samples is 24 and the number of genes is 10, then the default value of "n_components" will be 10
    pcaObject = PCA(n_components=3)
    pcaData = pcaObject.fit_transform(dataAfterStandardization)

    pcaVariancePercentage = pcaObject.explained_variance_ratio_
    #########################
    # End of CODE SIMILAR TO "generatePCA.py"
    #########################

    defaultColor = "#272E3F"
    defaultBorderColor = "#000000"
    defaultTitleFontColor = "#000000"

    pcaScatterCoordinates = [
        {
            'type': 'scatter3d',
            'mode': 'markers',
            'name': convertedData.columns[i],
            # In the PCA 2D, at the file "generatePCA.py", we use only x and y coordinates
            # In the PCA 3D, at this file, we use x, y, and z coordinates
            'x': [pcaData[i, 0]],
            'y': [pcaData[i, 1]],
            'z': [pcaData[i, 2]],
            'marker': {
                'size': 12,
                'color': defaultColor,
                'line': {
                    'color': defaultBorderColor,
                    'width': 2,
                }
            },
        } for i in range(len(convertedData.columns))
    ]

    layoutPCAPlotForReact = {
        'autosize': True,
        'hovermode': 'closest',
        'showlegend': True,
        'height': 1000,
        'scene': {
            'xaxis': {
                'title': f'PC1 ({pcaVariancePercentage[0]*100:.2f}%)',
                'titlefont': {
                    'size': 14,
                    'color': defaultTitleFontColor,
                },
            },
            'yaxis': {
                'title': f'PC2 ({pcaVariancePercentage[1]*100:.2f}%)',
                'titlefont': {
                    'size': 14,
                    'color': defaultTitleFontColor,
                },
            },
            'zaxis': {
                'title': f'PC3 ({pcaVariancePercentage[2]*100:.2f}%)',
                'titlefont': {
                    'size': 14,
                    'color': defaultTitleFontColor,
                },
            },
        }
    }

    result = {
        'data': pcaScatterCoordinates,
        'layout': layoutPCAPlotForReact
    }

    return jsonify(result)
