# Installing necessary packages ----
library(ggplot2) #For plotting   
library(tidyverse) #For data manipulation
library(rstan) #For STAN
library(extraDistr) #For distributions
library(bayesplot) #For mcmc_recover_hist

# Model for 4 item condition ----
model.stan4 = "
data { 
  int<lower = 1> N_trials;
  int<lower = 0, upper = N_trials> ans[4];  
}

parameters {
   simplex[4] weights;
   real<lower = 0,upper = 1> p_associative;
   real<lower = 0,upper = 1> p_ordinal;
   real<lower = 0,upper = 1> p_hierarchical;
   real<lower = 0,upper = 1> p_random;
   
} 

model {
  
  vector[4] theta;
  matrix[4,4] probability_matrix = [ [(1-p_associative)/11,p_ordinal/2,p_hierarchical, (1-(3*p_random/4))/3],  
                                   [(1-p_associative)/11,p_ordinal/2,(1-p_hierarchical)/11, (1-(3*p_random/4))/3],  
                                   [ p_associative, (1-p_ordinal)/10,(1-p_hierarchical)/11, (1-(3*p_random/4))/3 ],  
                                   [9*(1-p_associative)/11,9*(1-p_ordinal)/10, 9*(1-p_hierarchical)/11, 3*p_random/4]];

  p_associative ~ uniform(0,1);
  p_ordinal ~ uniform(0,1);
  p_hierarchical ~ uniform(0,1);
  p_random ~ uniform(0,1);

  
  
  weights ~ dirichlet(rep_vector(0.2,4));
  theta = probability_matrix*weights;
  ans ~ multinomial(theta);
  
  
}

"

# Model for 6 item condition ----
model.stan6 = "
data { 
  int<lower = 1> N_trials;
  int<lower = 0, upper = N_trials> ans[4];  
}

parameters {
   simplex[4] weights;
   real<lower = 0,upper = 1> p_associative;
   real<lower = 0,upper = 1> p_ordinal;
   real<lower = 0,upper = 1> p_hierarchical;
   real<lower = 0,upper = 1> p_random;

} 

model {
  
  vector[4] theta;
  matrix[4,4] probability_matrix = [ [(1-p_associative)/119,p_ordinal/6,p_hierarchical,(1-(678*p_random/720))/7],  
                                   [5*(1-p_associative)/119,5*p_ordinal/6,5*(1-p_hierarchical)/119,5*(1-(678*p_random/720))/7],  
                                   [ p_associative, (1-p_ordinal)/114,(1-p_hierarchical)/119, (1-(678*p_random/720))/7 ],  
                                   [113*(1-p_associative)/119,113*(1-p_ordinal)/114, 113*(1-p_hierarchical)/119, 678*p_random/720]];

  p_associative ~ uniform(0,1);
  p_ordinal ~ uniform(0,1);
  p_hierarchical ~ uniform(0,1);
  p_random ~ uniform(0,1);

  
  weights ~ dirichlet(rep_vector(0.2,4));
  theta = probability_matrix*weights;
  ans ~ multinomial(theta);
  
  
}

"

# Use this to play around and run the model ----

# You can use real values for 'ans' and 'N_trials'

# 'ans' contains [center-embedded, crossed, tail-recursive, and other]
# N_trials is the sum of the values in 'ans'

# Note that both ans' and 'N_trials' need to have integer values (not proportions)
# To replicate the paper results, take N_trials = 8
# Then, you can calculate the integer values for 'ans' from the proportion data in the data files

data_mn <-  list(N_trials = 10, ans = c(6,1,1,2)) 

# Running the model
fitted_model<-stan(model_code=model.stan4, data=data_mn, iter=10000, chains=4, cores=1)

# Viewing the results
# weights[1] is associative
# weights[2] is ordinal
# weights[3] is hierarchical
# weights[4] is random
print(fitted_model, pars = c("weights"))

