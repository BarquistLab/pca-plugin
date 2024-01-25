import matplotlib.pyplot as plt
import pandas as pd
import plotly.express as px
from sklearn import datasets
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

iris = datasets.load_iris()

df = pd.DataFrame(
    iris.data,
    columns=iris.feature_names
)

df['target'] = iris.target

# Map targets to target names
target_names = {
    0: 'setosa',
    1: 'versicolor',
    2: 'virginica'
}

df['target_names'] = df['target'].map(target_names)


# Standardize the features to have mean=0 and variance=1
features = ['sepal length (cm)', 'sepal width (cm)',
            'petal length (cm)', 'petal width (cm)']
x = df.loc[:, features].values
x = StandardScaler().fit_transform(x)

# Compute the PCA
pca = PCA(n_components=2)
principalComponents = pca.fit_transform(x)
principalDf = pd.DataFrame(data=principalComponents, columns=['PC1', 'PC2'])

# Concatenate the target_names to the principal components
finalDf = pd.concat([principalDf, df[['target_names']]], axis=1)

# Visualize the data
fig = px.scatter(finalDf, x='PC1', y='PC2', color='target_names')
fig.show()
