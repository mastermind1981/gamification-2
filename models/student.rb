require 'mongoid'

class Student
  include Mongoid::Document

  belongs_to :group
  belongs_to :classroom


  field :facebookId, :type => String
  field :expertLevel, :type => Integer, :default => 0
  field :badges, :type => Array, :default => []
end